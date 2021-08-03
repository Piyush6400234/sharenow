const dropZone = document.querySelector('.drop-zone')
const inputf = document.querySelector('#inputf')
const browseBtn = document.querySelector('.browseBtn')

const bgProgress = document.querySelector(".bg-progress");
const progressBar = document.querySelector(".progress-bar");
const progressContainer = document.querySelector(".progress-container");
const percentDiv = document.querySelector("#percent");

const sharingContainer = document.querySelector(".sharing-container");
const copyURLBtn = document.querySelector("#copyURLBtn");
const fileURLInput = document.querySelector("#fileURL");
const emailForm = document.querySelector("#emailForm");
const host = "https://share-your-files.herokuapp.com/"
const uploadURL = `${host}api/files`;
const emailURL = `${host}api/files/send`;

dropZone.addEventListener('dragover', (e)=>{
    // console.log("dragging")
    e.preventDefault()
    if(!dropZone.classList.contains('dragged'))
    {
        dropZone.classList.add('dragged')
    }
})
dropZone.addEventListener('dragleave', (e)=>{
    dropZone.classList.remove('dragged')
})
dropZone.addEventListener('drop', (e)=>{
    e.preventDefault()
    console.log(e);
    dropZone.classList.remove('dragged')
    const files = e.dataTransfer.files;//files in lvalue will be the file uploaded or dropped//////e.dataTransfer.files will be extracted by the browser.
    // console.log(files)
    if(files.length){
        inputf.files = files;//same dropped file is being inputted to input fiels in HTML page
        uploadfile()
    }

})
inputf.addEventListener("change", ()=>{
    uploadfile();
})
//after dropping the file we get an object e inside that object we have dataTransfer inside that we have files.do console.log(e) and you will get to know
browseBtn.addEventListener('click', (e)=>{
    inputf.click()
})
copyURLBtn.addEventListener("click", ()=>{
   fileURLInput.select()
   document.execCommand("copy")
   fileURLInput.value =""
   alert("copied to clipboard")
   sharingContainer.style.display = "none";
})
const uploadfile = ()=>{
    progressContainer.style.display = "block"
    if(inputf.files.length>1){
        inputf.value = ""
        // alert("can't upload more than one file :(")
        alert("can't upload more than 1 file")
        return;
    }
    const file = inputf.files[0]
    if(file.size> 100*1024*1024)
    {
        alert("can't upload more than 100 MB")
        inputf.value = ""
        return;
    }
    progressContainer.style.display = "block"
    
    const formData = new FormData() //creates a new form object that can be uploaded using post method
    formData.append("myfile",file)
    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = () =>{
        console.log(xhr.readyState);
        if(xhr.readyState === XMLHttpRequest.DONE){
            console.log(xhr.response)
            onUploadSuccess(JSON.parse(xhr.response))
        }
    }

    xhr.upload.onprogress = updateProgress;
    xhr.upload.onerror=()=>{
        inputf.value = ""
        alert(`error in upload ${xhr.statusText}`)
    }
    xhr.open("post", uploadURL);
    xhr.send(formData)
}

const updateProgress = (e)=>{  ///e will show how much is uploaded
    const percent = Math.round((e.loaded / e.total) * 100);
    // console.log(percent);
    bgProgress.style.width = `${percent}`
    percentDiv.innerText = percent
    progressBar.style.transform = `scaleX(${percent/100})`

}
const onUploadSuccess = ({file: url})=>{
   console.log(url)
   inputf.value = "";
   emailForm[2].removeAttribute("disbaled")
   progressContainer.style.display = "none"
   sharingContainer.style.display = "block"
   fileURLInput.value = url;
}
emailForm.addEventListener("submit", (e)=>{
    e.preventDefault();
    // console.log("form select")
    const url = fileURLInput.value
    //  const formData = 
    const formData = {
        uuid : url.split("/").splice(-1, 1)[0],
        emailTo: emailForm.elements["to-email"].value,
        emailFrom: emailForm.elements["to-email"].value
    }
    emailForm[2].setAttribute("disabled", "true")
    console.table(formData);
    fetch(emailURL, {
        method: "POST",
        headers: {
            "content-type": "application/json"
        },
        body: JSON.stringify(formData)
    }).then(res =>res.json()).then(({success})=>{
        // console.log();
        if(success){
            sharingContainer.style.display = "none";
            alert("Email sent")
        }
    })
})