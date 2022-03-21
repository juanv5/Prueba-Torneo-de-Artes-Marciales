import Personaje from "./Personaje.js";

class Saiyajin extends Personaje {
    constructor(nombre, img, poder, raza) {
        super(nombre, img, poder, raza)
    }
    transformacion() {
        let poder = this.getPoder()
        this.setPoder(parseInt(poder * 1.8))
    }
}

class Humano extends Personaje {
    constructor(nombre, img, poder, raza) {
        super(nombre, img, poder, raza)
    }
    coraje() {
        let poder = this.getPoder()
        this.setPoder(parseInt(poder * 1.2))
    }
}

export { Saiyajin, Humano }