var odin = require("odin"),
    vec2 = require("vec2"),
    vec3 = require("vec3"),
    quat = require("quat"),
    phys2d = require("phys2d");


var Component = odin.Component,
    ComponentPrototype = Component.prototype,
    Phys2DRigidBodyPrototype;


module.exports = Phys2DRigidBody;


function Phys2DRigidBody() {
    var _this = this;

    Component.call(this);

    this.body = new phys2d.RigidBody();

    this.__onCollide = function(body, si, sj) {
        return onCollide(_this, body, si, sj);
    };
    this.__onColliding = function(body, si, sj) {
        return onColliding(_this, body, si, sj);
    };
}
Component.extend(Phys2DRigidBody, "Phys2DRigidBody");
Phys2DRigidBodyPrototype = Phys2DRigidBody.prototype;

Phys2DRigidBodyPrototype.awake = function() {
    var body = this.body,
        components = this.entity.components,
        transform = components.Transform,
        transform2d = components.Transform2D;

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
Phys2DRigidBodyPrototype.update = function() {
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
