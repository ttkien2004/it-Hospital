const express = require('express');
const port = 80;

const { initializeApp } = require('firebase/app');
const { getDatabase, ref, set, onValue, get, child, remove} = require('firebase/database');
const bodyParser = require('body-parser');
const {
    getFirestore, collection, onSnapshot,
    addDoc, deleteDoc, doc,
    query, where,
    orderBy, serverTimestamp,
    getDoc,
    Timestamp,
    QuerySnapshot,
    updateDoc, setDoc
} =  require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyCP_0hKxMychNVPfFeozLAytkurhZ6B8Cg",
  authDomain: "ithopital.firebaseapp.com",
  databaseURL: "https://ithopital-default-rtdb.firebaseio.com",
  projectId: "ithopital",
  storageBucket: "ithopital.appspot.com",
  messagingSenderId: "513901096082",
  appId: "1:513901096082:web:449e1809ecbf7c7d860a4b",
  measurementId: "G-WDFCQQ7JX7"
};

const app2 = initializeApp(firebaseConfig);
const database = getDatabase(app2);
const firestore = getFirestore();
const colRefTreatment = collection(firestore, 'treatment');
const colRefBill = collection(firestore, 'bill');
const app = express();

app.use(express.json());
app.use(bodyParser.json());

app.get('/api/getAllMedicine', (req, res) => {
    const dbRef = ref(database)
    get(child(dbRef, "admin/medicine/data/"))
    .then((snapshot) => {
        if(snapshot.exists()){        
            res.json(snapshot.val().filter(item => item !== null));
        }else{
            console.log("ID does not exist")
        }
    })
    .catch(err => {
        console.log(err.message)
    })
});

app.get('/api/getAllMachine', (req, res) => {
    const dbRef = ref(database)
    get(child(dbRef, "admin/machine/data/"))
    .then((snapshot) => {
        if(snapshot.exists()){        
            res.json(snapshot.val().filter(item => item !== null));
        }else{
            console.log("ID does not exist")
        }
    })
    .catch(err => {
        console.log(err.message)
    })
});

app.get('/api/getDoctor', (req, res) => {
    const dbRef = ref(database)
    get(child(dbRef, "Doctor/"))
    .then((snapshot) => {
        if(snapshot.exists()){        
            res.json(snapshot.val());
        }else{
            console.log("ID does not exist")
        }
    })
    .catch(err => {
        console.log(err.message)
    })
});

app.get('/api/getBill', (req, res) => {
    onSnapshot(colRefBill, (snapshot) => {
        let list = [];
        snapshot.docs.forEach((doc) => {
            list.push({ ...doc.data(), id: doc.id });
        })
        res.json(list);
    });
});

app.get('/api/treatment', (req, res) => {
    onSnapshot(colRefTreatment, (snapshot) => {

        let list = [];
        snapshot.docs.forEach((doc) => {
            list.push({ ...doc.data(), id: doc.id });
        })
        res.json(list);
    });
});

async function addBillToDb(patient, room, bhyt, contact, precription, medications, money, date, note) {
    try {
        setDoc(doc(firestore, 'bill', precription), {
            patient: patient,
            room: room,
            bhyt: bhyt,
            contact: contact,
            precription: precription,
            medications: medications,
            money: money,
            date: date,
            note: note
        }).then(() => {
            console.log("Add bill successfully");
        });
    } catch (error) {
        console.error(error);
        throw error;
    }
}

// bill_data = {
//     "patient": document.getElementById("bill_name").textContent,
//     "room": document.getElementById("bill_room").textContent.match(/\d+/)[0],
//     "bhyt": document.getElementById("bill_bhyt").textContent.match(/\d+/)[0],
//     "contact": document.getElementById("bill_contact").textContent.match(/\d+/)[0],
//     "precription": precription,
//     "medications": med,
//     "money": money,
//     "date": document.getElementById("date_bill").value,
//     "note": document.getElementById("note").value
//   }

app.post('/api/addBill', async (req, res) => {
    const {patient, room, bhyt, contact, precription, medications, money, date, note } = req.body;
    await addBillToDb(patient, room, bhyt, contact, precription, medications, money, date, note);
});


async function ListMedicine() {
    try {
        const dbRef = ref(database);
        const snapshot = await get(child(dbRef, `admin/medicine/data`));
        if (snapshot.exists()) {
            return snapshot.val();
        } else {
            return 0;
        }
    } catch (error) {
        console.error(error);
        throw error;
    }
}

app.get('/api/getMedicine', async (req, res) => {
    let medicine = await ListMedicine();
	res.status(200).json(medicine);
});


//for medicine
async function getLastID() {
    try {
        const dbRef = ref(database);
        const snapshot = await get(child(dbRef, `admin/medicine/data`));
        if (snapshot.exists()) {
            return snapshot.val().length;
        } else {
            return 0;
        }
    } catch (error) {
        console.error(error);
        throw error;
    }
}

async function insertMedicine(id, category, name, price, brand, qty, status){
    set(ref(database, 'admin/medicine/data/' + id), {
    name: name,
    category : category,
    id : id,
    price : price,
    product_brand : brand,
    status : status,
    qty : qty
    });
    console.log("Medicine id "+id+" have been create!");
}

async function removeMedicine(id){
    remove(ref(database, 'admin/medicine/data/' + id));
    console.log("Medicine id "+id+" have been remove!");
}

app.post('/api/remove-medicine', async (req, res) =>{
    await removeMedicine(req.body.id);
    res.status(200).json({ message: "Medicine removed successfully" });
})

app.post('/api/add-medicine', async (req, res) =>{
	let id = await getLastID();
    const {id_cr, product_name, product_brand, price, qty, category } = req.body;
    if(id_cr != 0){id = id_cr;}
	await insertMedicine(id,category,product_name,"$"+price,product_brand,qty,1);
	res.status(200).json({ message: "Medicine added successfully" });
});
//end for medicine

//for machine

async function getLastIDMachine() {
    try {
        const dbRef = ref(database);
        const snapshot = await get(child(dbRef, `admin/machine/data`));
        if (snapshot.exists()) {
            return snapshot.val().length;
        } else {
            return 0;
        }
    } catch (error) {
        console.error(error);
        throw error;
    }
}

async function insertMachine(id, period, name, price, brand, position, status){
    set(ref(database, 'admin/machine/data/' + id), {
    name: name,
    period : period,
    id : id+1,
    price : price,
    product_brand : brand,
    status : status,
    position : position
    });
    console.log("Machine id "+id+" have been create!");
}

async function removeMachine(id){
    remove(ref(database, 'admin/machine/data/' + id));
    console.log("Machine id "+id+" have been remove!");
}

app.post('/api/remove-machine', async (req, res) =>{
    await removeMachine(req.body.id);
    res.status(200).json({ message: "Machine removed successfully" });
})

app.post('/api/add-machine', async (req, res) =>{
	let id = await getLastIDMachine();
    const {id_cr, product_name, product_brand, price, pos, period } = req.body;
    if(id_cr != 0){id = id_cr;}
	await insertMachine(id,period,product_name,"$"+price,product_brand,pos,1);
	res.status(200).json({ message: "Machine added successfully" });
});

//end for machine


//for staff

async function getLastIDStaff() {
    try {
        const dbRef = ref(database);
        const snapshot = await get(child(dbRef, `Doctor`));
        if (snapshot.exists()) {
            return snapshot.val().length;
        } else {
            return 0;
        }
    } catch (error) {
        console.error(error);
        throw error;
    }
}

async function insertDoctor(id, fullname, degree, email,contact,specialist, department, role){
    set(ref(database, 'Doctor/' + id), {
    id : id+1,
    firstName: fullname,
    lastName: "Wait...",
    degree : degree,
    email: email,
    contact: contact,
    specialist: specialist,
    department : department,
    graduationYear : "graduationYear",
    patientList : [],
    role : role,
    workTime: [],
    userId: ""
    });
    console.log("Doctor id "+id+" have been create!");
}

async function removeDoctor(id){
    remove(ref(database, 'Doctor/' + id));
    console.log("Doctor id "+id+" have been remove!");
}

app.post('/api/remove-doctor', async (req, res) =>{
    await removeDoctor(req.body.id);
    res.status(200).json({ message: "Doctor removed successfully" });
})

app.post('/api/add-doctor', async (req, res) =>{
	let id = await getLastIDStaff();
    const {fullname, degree, email,contact,specialist, department, role } = req.body;
    console.log(req.body);
	await insertDoctor(id,fullname, degree,email,contact,specialist, department, role);
	res.status(200).json({ message: "Doctor added successfully" });
});

//end for staff

app.use(express.static(__dirname + '/public'));
app.get('/', (req, res) => { return res.render('index'); });
app.listen(port, () => console.log(`Example app listening on port ${port}!`));

