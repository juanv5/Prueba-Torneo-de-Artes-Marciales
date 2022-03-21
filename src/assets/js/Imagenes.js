import Personajes from "./Consulta.js"

const contenedorPersonaje = document.querySelector(".personajes")
document.querySelector("#buttonImages").addEventListener("click", async() => {
    const { personajes } = await Personajes.getData()
    console.log(personajes)
    const pj = document.querySelector("#nombre").value
    const imagenesPJTemplate = personajes.find((p) => p.name == pj).imagenes.map((i) => `<img width="200" src="/assets/imgs/${pj}/${i}" />`).join("")
    contenedorPersonaje.innerHTML = imagenesPJTemplate

    document.querySelectorAll(".personajes img").forEach(i => {
        i.addEventListener('click', (e) => {
            $('#imagenesModal').modal('toggle')
            const imagenSrc = e.target.src
            document.querySelector('#preview').style.backgroundImage = `url(${imagenSrc})`
        })
    })
})