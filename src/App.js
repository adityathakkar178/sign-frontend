import React, { useState } from 'react';
import axios from 'axios';

const App = () => {
    const [message, setMessage] = useState('');
    const [signature, setSignature] = useState('');

    const handleSignMessage = async () => {
        try {
            if (window.ethereum) {
                const accounts = await window.ethereum.request({
                    method: 'eth_requestAccounts',
                });
                const signerAddress = accounts[0];
                const signature = await window.ethereum.request({
                    method: 'personal_sign',
                    params: [message, signerAddress],
                });
                const response = await axios.post(
                    'http://localhost:3001/sign',
                    {
                        message: message,
                    }
                );
                setSignature(signature);
            }
        } catch (error) {
            console.error('Error signing message:', error);
        }
    };

    return (
        <div>
            <input
                type="text"
                placeholder="Enter message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
            />
            <button onClick={handleSignMessage}>Sign Message</button>
            {signature && <div>Signature: {signature}</div>}
        </div>
    );
};

export default App;
