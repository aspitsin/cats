"use strict"
const container = document.querySelector(".container");
const popupAdd = document.querySelector(".popup-add");
const addForm = document.forms.addForm;
const popupEdit = document.querySelector(".popup-edit");
const editForm = document.forms.editForm;
const cards = document.getElementsByClassName("card");
let cats;
let counter = 0;

const createModalCardHtml = function(cat){
	return `
	<div class="modal_card">
	<div class="modal_image" style="background-image:url('${cat.img_link}')"></div>
	<div class="modal_right">
		<div class="modal_content">	
			<i class="far fa-times-circle modal_close"></i>
			<h2 class="modal_card-name">${cat.name}</h2>
			<p class="modal_card-id"><b>ID:</b> ${cat.id}</p>
			<p class="modal_card-age"><b>Возраст:</b> ${cat.age}</p>
			<p class="modal_card-rate">${cat.rate}</p>
			<p class="modal_card-description"><b>Описание:</b> ${cat.description }</p>
		</div>
	</div>
</div>
`}

const openModelCard = function(id){
			let data = JSON.parse(localStorage.getItem("catArr")).filter((el) => el.id === id)[0];
			const wrapper = document.querySelector('.modal-wrapper');
			wrapper.insertAdjacentHTML("afterbegin", createModalCardHtml(data));
			wrapper.classList.add('active');

			const modalCard = wrapper.querySelector('.modal_card')
			wrapper.querySelector(".modal_close").addEventListener("click", function(e){
				modalCard.remove();
				wrapper.classList.remove('active')
	})
}

const createCard = function(cat, parent) {
	const card = document.createElement("div");
	card.className = "card";
	card.setAttribute("data-card_id", `${cat.id}`);

	const img = document.createElement("div");
	img.className = "card_img";
	img.setAttribute("data-action", "open");
	if (cat.img_link) {
		img.style.backgroundImage = `url(${cat.img_link})`;
	} else {
		img.style.backgroundImage = "url(https://otvet.imgsmail.ru/download/875a8375f91de049494d6073098e8a2f_7fc8313f32a9e3a53a18cf8676891956.jpg)";
		img.style.backgroundSize = "contain";
		img.style.backgroundColor = "transparent";
	}

	// const favourite = document.createElement("i");
	// favourite.className = "far fa-heart heart";
	// favourite.setAttribute("data-action", "favourite");

	const name = document.createElement("h3");
	name.innerText = cat.name;
	name.setAttribute("data-action", "open");

    const del = document.createElement("button");
	del.className = "del_btn"
    del.innerHTML = `<i data-action="delete" class="fas fa-light fa-trash"></i>`;
	del.setAttribute("data-action", "delete");

	const edit = document.createElement("button");
	edit.className = "edit_btn"
    edit.innerHTML = `<i data-action="edit" class="fas fa-light fa-pen"></i>`;
	edit.setAttribute("data-action", "edit");

	const cardContent = document.createElement("div");
	cardContent.className = "card-content";

	cardContent.append(name, del, edit)
	card.append(img, cardContent)
	parent.append(card);
}

container.addEventListener("click", function(e){
	const cardWr = e.target.closest('[data-card_id]');
	const cardId = cardWr.dataset.card_id;

	if(e.target.parentElement.dataset.action === "delete"){
		deleteCat(cardId, cardWr);
	} else if(e.target.parentElement.dataset.action === "edit"){
		popupEdit.classList.add("active");
		editForm.setAttribute("data-id", cardId);
	 	showEditForm(cardId);
	} else {
		openModelCard(cardId);
	}
})

const setCards = function(arr) {
	container.innerHTML = "";
    arr.forEach(function(el) {
        createCard(el, container);
    })
}

const showEditForm = function(id) {
	let data = JSON.parse(localStorage.getItem("catArr")).filter((el) => el.id === id)[0];
	for (let i = 0; i < editForm.elements.length; i++) {
		let el = editForm.elements[i];
		if (el.name) {
			if (el.type !== "checkbox") {
				el.value = data[el.name] ? data[el.name] : "";
			} else {
				el.checked = data[el.name];
			}
		}
	}
}

const addCat = function(cat) {
	fetch("https://sb-cats.herokuapp.com/api/2/aspitsin/add", {
		method: "POST",
		headers: { // обязательно для POST/PUT/PATCH
			"Content-Type": "application/json"
		},
		body: JSON.stringify(cat) // обязательно для POST/PUT/PATCH
	})
		.then(res => res.json())
		.then(data => {
			if (data.message === "ok") {
				createCard(cat, container);
				cats.push(cat);
                localStorage.setItem("catArr", JSON.stringify(cats))
                addForm.reset();
                popupAdd.classList.remove("active");
			}
		})
}

const deleteCat = function(id,tag){
    fetch(`https://sb-cats.herokuapp.com/api/2/aspitsin/delete/${id}`, {
        method: "DELETE"
    })
    .then(res => res.json())
    .then(data => {
        if(data.message === "ok"){
            tag.remove();
			cats = cats.filter(el => +el.id !== +id);
        	localStorage.setItem("catArr", JSON.stringify(cats));
        }
    })
}


popupAdd.querySelector(".popup_close").addEventListener("click", function(e){
    popupAdd.classList.remove("active");
})

popupEdit.querySelector(".popup_close").addEventListener("click", function(e){
    popupEdit.classList.remove("active");
})


document.querySelector("#add").addEventListener("click", function(e) {
	e.preventDefault();
	counter = counter + 1
	addForm.elements.id.value = counter; 
    popupAdd.classList.add("active");

})

addForm.addEventListener("submit", function(e){
    e.preventDefault();
    let body = {};

    for (let i = 0; i < addForm.elements.length; i++) {
        let el = addForm.elements[i];
		if (el.name) {
			body[el.name] = el.name === "favourite" ? el.checked : el.value;
		}
    }
    addCat(body);
})

editForm.addEventListener("submit", function(e) {
	e.preventDefault();
	let body = {}; 

	for (let i = 0; i < this.elements.length; i++) {
		let el = this.elements[i];
		if (el.name) {
			body[el.name] = el.name === "favourite" ? el.checked : el.value;
		}
	}
	editCat(body, editForm.dataset.id);
});


const editCat = async function(obj,id){
	let res = await fetch(`https://sb-cats.herokuapp.com/api/2/aspitsin/update/${id}`, {
		method: "PUT",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(obj)
	})
	let answer = await res.json();
	if (answer.message === "ok") {
		cats = cats.map(el => {
            if (+el.id === +id) {
                return {...el, ...obj};
            } else {
                return el;
            }
        });
		localStorage.setItem("catArr", JSON.stringify(cats));
		setCards(cats);
		editForm.reset();
		popupEdit.classList.remove("active");
	}
}



cats = localStorage.getItem("catArr");
if (cats) {
    cats = JSON.parse(cats); // [{}, {}]
    setCards(cats);
} else {
    fetch(`https://sb-cats.herokuapp.com/api/2/aspitsin/show`)
	.then(res => res.json())
	.then(result => {
		if (result.message === "ok") {
            cats = result.data;
            localStorage.setItem("catArr", JSON.stringify(cats));
			setCards(cats);
		}
	});
}

// const heart = document.querySelector('.heart');
// heart.addEventListener("mousemove", function(e){
// 	heart.classList.add('fas');
// 	heart.classList.remove('far');
// 	heart.addEventListener("mouseout", function(e){
// 		heart.classList.add('far');
// 		heart.classList.remove('fas');
// 	}) 
// })

// const checkFavourite = function(cardId){

// }
