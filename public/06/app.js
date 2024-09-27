// set up basic variables for app

const soundClips = document.querySelector('.sound-clips');

//main block for doing the audio recording
const renderAudio = (data, id) => {
    const clipContainer = document.createElement('article');
    const clipLabel = document.createElement('p');
    const audio = document.createElement('audio');
    const deleteButton = document.createElement('button');

    clipContainer.classList.add('clip');
    clipContainer.setAttribute('data-id', id)
    audio.setAttribute('controls', '');
    deleteButton.textContent = 'Delete';
    deleteButton.className = 'delete';
    deleteButton.setAttribute('data-id', id);

    if(data.title === null) {
      clipLabel.textContent = 'My unnamed clip';
    } else {
      clipLabel.textContent = data.title;
    }

    clipContainer.appendChild(audio);
    clipContainer.appendChild(clipLabel);
    clipContainer.appendChild(deleteButton);
    soundClips.appendChild(clipContainer);

    audio.controls = true;
    const uint8Array = data.audio.toUint8Array();
    const blob = new Blob([uint8Array], { type: 'audio/ogg; codecs=opus' });
    const audioURL = window.URL.createObjectURL(blob);
    audio.src = audioURL;
    console.log("recorder stopped");

}

const removeAudio = (id) => {
    /*deleteButton.onclick = function(e) {
        e.target.closest(".clip").remove();
      }*/

    const klip = document.querySelector(`.clip[data-id='${id}']`);
    klip.remove();
}