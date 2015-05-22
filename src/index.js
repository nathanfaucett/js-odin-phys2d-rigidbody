var odin = require("odin"),
    vec2 = require("vec2"),
    vec3 = require("vec3"),
    quat = require("quat"),
    phys2d = require("../../../src");


var Component = odin.Component,
    ComponentPrototype = Component.prototype,
    RigidBodyPrototype;


module.exports = RigidBody;


function RigidBody() {
    var _this = this;

    Component.call(this);

    this.body = new phys2d.Rigidbody();

    this.__onCollide = function(body, si, sj) {
        return onCollide(_this, body, si, sj);
    };
    this.__onColliding = function(body, si, sj) {
        return onColliding(_this, body, si, sj);
    };
}
Component.extend(RigidBody, "RigidBody");
RigidBodyPrototype = RigidBody.prototype;

RigidBodyPrototype.awake = function() {
    var body = this.body,
        gameObject = this.gameObject,
        transform = gameObject.transform,
        transform2d = gameObject.transform2d;

    ComponentPrototype.awake.call(this);

    if (transform) {
        vec3.copy(body.position, transform.position);
        body.rotation = quat.rotationZ(transform.rotation);
    } else {
        vec2.copy(body.position, transform2d.position);
        body.rotation = transform2d.rotation;
    }

    body.init();
    body.data = this;
    body.on("collide", this.__onCollide);
    body.on("colliding", this.__onColliding);
};

var update_zaxis = vec3.create(0.0, 0.0, 1.0);
RigidBodyPrototype.update = function() {
    var body = this.body,
        components = this.entity.components,
        transform = components.Transform,
        transform2d = components.Transform2D;

    if (transform) {
        vec3.copy(transform.position, body.position);
        quat.fromAxisAngle(transform.rotation, update_zaxis, body.rotation);
    } else if (transform2d) {
        vec2.copy(transform2d.position, body.position);
        transform2d.rotation = body.rotation;
    }
};

function onCollide(_this, body, si, sj) {
    if (body.data) {
        _this.emit("collide", body.data, body, si, sj);
    }
}

function onColliding(_this, body, si, sj) {
    if (body.data) {
        _this.emit("colliding", body.data, body, si, sj);
    }
}
