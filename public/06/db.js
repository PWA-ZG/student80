db.enablePersistence() //offline rad
  .catch(function(err) {
    if (err.code == 'failed-precondition') {
      // probably multible tabs open at once
      console.log('persistance failed');
    } else if (err.code == 'unimplemented') {
      // lack of browser support for the feature
      console.log('persistance not available');
    }
  });

//real time listener
db.collection('audios').onSnapshot((snapshot) => {
    var audios = [];
    snapshot.forEach((doc) => {
        audios.push({
            id: doc.id,
            data: doc.data()
          });
    })
    console.log('All audios', audios);
    snapshot.docChanges().forEach(change => {
        if(change.type === 'added') {
            renderAudio(change.doc.data(), change.doc.id);
        }
        if(change.type === 'removed') {
            removeAudio(change.doc.id);
        }
    })
})


// Function to get all audios from the 'audios' collection
/*function getAllAudios(callback) {

    return db.collection('audios').get().then((querySnapshot) => {
      var audios = [];

      querySnapshot.forEach((doc) => {
        audios.push({
          id: doc.id,
          data: doc.data()
        });
      });
  
      // Call the callback function with the array of audios
      callback(audios);
    }).catch((error) => {
      // Handle errors
      console.error('Error getting documents:', error);
      throw error; // Rethrow the error for further handling if needed
    });
  }*/
  



// set up basic variables for app

const record = document.querySelector('.record');
const stop = document.querySelector('.stop');

// disable stop button while not recording

stop.disabled = true;
//let audioCtx;
//main block for doing the audio recording

if (navigator.mediaDevices.getUserMedia) {
  console.log('getUserMedia supported.');

  const constraints = { audio: true };
  let chunks = [];

  let onSuccess = function(stream) {
    const mediaRecorder = new MediaRecorder(stream);

    //visualize(stream);

    record.onclick = function() {
      mediaRecorder.start();
      console.log(mediaRecorder.state);
      console.log("recorder started");
      record.style.background = "red";

      stop.disabled = false;
      record.disabled = true;
    }

    stop.onclick = function() {
      mediaRecorder.stop();
      console.log(mediaRecorder.state);
      console.log("recorder stopped");
      record.style.background = "";
      record.style.color = "";
      // mediaRecorder.requestData();

      stop.disabled = true;
      record.disabled = false;
    }

    mediaRecorder.onstop =  function(e) {
      console.log("data available after MediaRecorder.stop() called.");

      const clipName = prompt('Enter a name for your sound clip?','My unnamed clip');

      const blob = new Blob(chunks, { 'type' : 'audio/ogg; codecs=opus' });
      const reader = new FileReader();
      reader.onloadend = function() {
        const audioDataArray = new Uint8Array(reader.result);
        //console.log(audioDataArray)
        // Store the audio data in Firestore
        db.collection('audios').add({
            title: clipName,
            audio: firebase.firestore.Blob.fromUint8Array(audioDataArray),
        }).catch(err => console.log(err));
        console.log('Audio data stored in Firestore.');
    };
      reader.readAsArrayBuffer(blob);
      chunks = [];
      console.log("recorder stopped");
    }

    mediaRecorder.ondataavailable = function(e) {
      chunks.push(e.data);
    }
  }

  let onError = function(err) {
    console.log('The following error occured: ' + err);
  }

  navigator.mediaDevices.getUserMedia(constraints).then(onSuccess, onError);

} else {
   console.log('getUserMedia not supported on your browser!');
}

const sC = document.querySelector('.sound-clips');
sC.addEventListener('click', event => {
    if(event.target.tagName === "BUTTON"){
        const id = event.target.getAttribute('data-id');
        db.collection('audios').doc(id).delete();

        /*getAllAudios((audios) => {
            console.log('All Audios:', audios);
          });*/
    }
})

/*function visualize(stream) {
    if(!audioCtx) {
      audioCtx = new AudioContext();
    }
  
    const source = audioCtx.createMediaStreamSource(stream);
  
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 2048;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
  
    source.connect(analyser);
    //analyser.connect(audioCtx.destination);
}*/