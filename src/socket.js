import { io } from  "socket.io-client";             //syntax to import module
                                                    //io is a function that takes url and options as arguments


export const initSocket = async() => {              //read documentation of socket.io-client again
    const options = {                               //basic options required to connect socket
        transports: ["websocket"],
        'force new connection': true,
        reconnectionAttempt: 'Infinity',
        timeout: 10000
    };

    return io("http://localhost:5000", options);            //backend url of react app
}