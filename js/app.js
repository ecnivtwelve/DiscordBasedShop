// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.9.1/firebase-app.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AgdfghdfhfgdhfghzUFjNTqMjks",
  authDomain: "vincahsfxgi.firebaseapp.com",
  projectId: "vincahsfxgi",
  storageBucket: "vincahsfxgi.appspot.com",
  messagingSenderId: "78959515067",
  appId: "1:740400005067:web:4187494890d09897f404e"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

let userdata;
let userDynamicURL = "";

import { collection, query, getFirestore, where, getDocs, doc, getDoc, setDoc } from 'https://www.gstatic.com/firebasejs/9.9.1/firebase-firestore.js'

const db = getFirestore();

let finalUserData;

if (localStorage.getItem('userdata') === null) {
    window.location.href = 'https://discord.com/api/oauth2/authorize?client_id=1002205807758299256&redirect_uri=https%3A%2F%2Fvincahsfxgi.web.app%2Fauth.html&response_type=code&scope=identify%20email';
}
else {
    userdata = JSON.parse(localStorage.getItem('userdata'));
    const users = collection(db, "utilisateurs");

    const docRef = doc(db, "utilisateurs", userdata.id);
    const dbUserData = await getDoc(docRef);
    finalUserData = dbUserData.data();
    
    if(finalUserData === undefined) {
        let newData = {
            avatar: userdata.avatarURL,
            username: userdata.username + "#" + userdata.discriminator,
            balance: 0,
        }
        await setDoc(docRef, newData);
        const finalUserData = newData;
    }

    if(currentPage !== "profile") {
        document.getElementById("AllCoinsText").innerHTML = finalUserData.balance;
    }

    parseUserdata(userdata, finalUserData);
}

function parseUserdata(userdata, finalUserData) {
    if(currentPage === "profile") {
        let user_avatar = document.getElementById('user_avatar');
        let user_name = document.getElementById('user_name');
        let user_balance = document.getElementById('user_balance');

        user_avatar.src = userdata.avatarURL;
        user_name.innerHTML = userdata.username + '<span>#' + userdata.discriminator + '</span>';
        user_balance.innerHTML = fMl(finalUserData.balance);
    }    
}

if(currentPage === "products") {
    const q = query(collection(db, "products"), where("quantity", "!=", 0));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
        // doc.data() is never undefined for query doc snapshots
        console.log(doc.id, " => ", doc.data());

        document.querySelector('#newProducts').innerHTML += `
            <a href="product.html?id=${doc.id}"><div class="product">
                <img src="${doc.data().image}" alt="">
                <div class="product_info">
                    <h2>${doc.data().title}</h2>
                    <p class="desc">${doc.data().description}</p>
                    <p class="price">${fMl(doc.data().price)}<img src="coin.png" class="coin"></p>
                    <p class="qt">${doc.data().quantity} restant(s)</p>
                </div>
            </div></a>
        `;
    });
}

function fMl(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

if(currentPage === "product") {
    let URLParams = new URLSearchParams(window.location.search);
    let productID = URLParams.get('id');

    let docRef = doc(db, "products", productID);
    let dbProdData = await getDoc(docRef);
    let finalProdData = dbProdData.data();

    console.log(finalProdData);

    document.querySelector('app').innerHTML += `
        <div class="product full">
            <img class="showroom" src="${finalProdData.image}" alt="">
            <div class="product_info">
                <h2>${finalProdData.title}</h2>
                <p class="desc">${finalProdData.description}</p>
                <p class="price">${fMl(finalProdData.price)}<img src="coin.png" class="coin"></p>
                <p class="qt">${finalProdData.quantity} restant(s)</p>
            </div>
        </div>
        <button id="buyProduct" class="buyProd">Acheter</button>
        <div id="owners">
        <h3>Propriétaires</h3>
        </div>
    `;

    document.getElementById("buyProduct").addEventListener("click", async () => {buyProduct()});

    if(finalProdData.quantity === 0) {
        document.querySelector('.buyProd').disabled = true;
        document.querySelector('.buyProd').classList.add('disabled');
        document.querySelector('.buyProd').innerHTML = "Stock écoulé";
    }

    // change page title
    document.querySelector('title').innerHTML = finalProdData.title + " - Vincahsfxgi";

    for(let person in finalProdData.owners) {
        let owner = finalProdData.owners[person];
        const docRef2 = doc(db, "utilisateurs", owner);
        const dbUserData2 = await getDoc(docRef2);
        let finalUserData2 = dbUserData2.data();
        
        document.querySelector('#owners').innerHTML += `
            <div class="owner">
                <img src="${finalUserData2.avatar}" alt="">
                <div>
                    <p>${finalUserData2.username}</p>
                    <small>Propriétaire</small>
                </div>
            </div>
        `;

        if(owner === userdata.id) {
            document.querySelector('.buyProd').disabled = true;
            document.querySelector('.buyProd').classList.add('disabled');
            document.querySelector('.buyProd').innerHTML = "Vous en êtes propriétaire !";
        }
    }    
}

if(currentPage === "profile") {
    const q = query(collection(db, "products"), where("owners", "array-contains", userdata.id));
    const querySnapshot = await getDocs(q);
    if(querySnapshot.length === 0) {
        document.querySelector('#library').innerHTML += `
            <div class="product">
                Vous n'avez pas encore acheté de produits
            </div>
        `;
    }
    querySnapshot.forEach((doc) => {
        console.log(doc.id, " => ", doc.data());
        document.querySelector('#library').innerHTML += `
            <a href="product.html?id=${doc.id}">
                <div class="libraryItem">
                    <img src="${doc.data().image}" alt="">
                    <div>
                        <h4>${doc.data().title}</h4>
                        <p class="balance">${fMl(doc.data().price)} <img src="coin.png" class="coin"></p>
                    </div>
                </div>
            </a>
        `;
    });
}

async function buyProduct() {
    let URLParams = new URLSearchParams(window.location.search);
    let productID = URLParams.get('id');

    let docRef3 = doc(db, "products", productID);
    let dbProdData = await getDoc(docRef3);
    let finalProdData = dbProdData.data();

    if(finalUserData.balance >= finalProdData.price) {
        let newProduct = finalProdData;
        newProduct.owners.push(userdata.id);
        newProduct.quantity = newProduct.quantity - 1;

        const docRef2 = doc(db, "products", productID);
        await setDoc(docRef2, newProduct);

        let newUser = finalUserData;
        newUser.balance = newUser.balance - finalProdData.price;

        const docRef = doc(db, "utilisateurs", userdata.id);
        await setDoc(docRef, newUser);

        location.reload();
    }
    else {
        alert("Vous n'avez pas assez d'argent !");
    }
}

if(currentPage == "getCoins") {
    document.getElementById("amont").addEventListener("input", () => {
        let coins = document.getElementById("amont").value;
        let kpmoney = coins * 1.3850695063;
    
        document.getElementById("equiv1").innerHTML = kpmoney.toFixed(0);
        document.getElementById("equiv2").innerHTML = kpmoney.toFixed(0);
    
        let cmd = `.give <@913134436198019092> ${kpmoney.toFixed(0)} #vincahsfxgi`;
        document.getElementById("cmd").value = cmd;
    });
}