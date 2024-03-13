const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');

let peerConnection;
let roomId;

navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    .then((stream) => {
        localVideo.srcObject = stream;

        const socket = io('https://192.168.0.72:3000',
        );

        socket.on('connect', () => {
            roomId = prompt('You love me, yes or no?: ');
            socket.emit('joinRoom', roomId);
        });

        socket.on('userJoined', (userId) => {
            console.log('User joined:', userId);
            createPeerConnection(userId);
            createOffer(userId);
        });

        socket.on('offer', (offer) => {
            console.log('Received offer:', offer);
            createAnswer(offer);
        });

        socket.on('answer', (answer) => {
            console.log('Received answer:', answer);
            setRemoteDescription(answer);
        });

        socket.on('iceCandidate', (candidate) => {
            console.log('Received ICE candidate:', candidate);
            addIceCandidate(candidate);
        });

        socket.on('userLeft', (userId) => {
            console.log('User left:', userId);
            peerConnection.close();
        });
    });

function createPeerConnection(userId) {
    peerConnection = new RTCPeerConnection();
    peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
            socket.emit('iceCandidate', event.candidate);
        }

    }
}
