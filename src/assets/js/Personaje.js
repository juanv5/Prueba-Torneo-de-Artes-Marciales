class Personaje {
    constructor(nombre, img, poder, raza) {
        const _nombre = nombre
        const _img = img
        let _poder = poder
        const _raza = raza

        this.getNombre = () => _nombre
        this.getImg = () => _img
        this.getPoder = () => _poder
        this.getRaza = () => _raza

        this.setPoder = (poder) => (_poder = poder)
    }
    get nombre() {
        return this.getNombre()
    }
    get img() {
        return this.getImg()
    }
    get raza() {
        this.getRaza()
    }
    get poder() {
        this.getPoder()
    }
    set poder(numeroPoder) {
        this.setPoder(numeroPoder)
    }
}

export default Personaje