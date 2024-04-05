import React, { useState } from 'react';
import axios from 'axios';

const App = () => {
    const [message, setMessage] = useState('');
    const [signature, setSignature] = useState('');
    const [signingMethod, setSigningMethod] = useState('personal_sign');

    const handleSignMessage = async () => {
        try {
            if (window.ethereum) {
                const accounts = await window.ethereum.request({
                    method: 'eth_requestAccounts',
                });
                const signerAddress = accounts[0];

                let signatureResponse;
                if (signingMethod === 'personal_sign') {
                    signatureResponse = await window.ethereum.request({
                        method: 'personal_sign',
                        params: [message, signerAddress],
                    });
                } else if (signingMethod === 'eth_signTypedData_v4') {
                    signatureResponse = await window.ethereum.request({
                        method: 'eth_signTypedData_v4',
                        params: [
                            '0x2D4742c77824E4faFbee5720AB4Aa34bf3602da8',
                            {
                                types: {
                                    EIP712Domain: [
                                        {
                                            name: 'name',
                                            type: 'string',
                                        },
                                        {
                                            name: 'version',
                                            type: 'string',
                                        },
                                        {
                                            name: 'chainId',
                                            type: 'uint256',
                                        },
                                        {
                                            name: 'verifyingContract',
                                            type: 'address',
                                        },
                                    ],
                                    Person: [
                                        {
                                            name: 'name',
                                            type: 'string',
                                        },
                                        {
                                            name: 'wallet',
                                            type: 'address',
                                        },
                                    ],
                                    Mail: [
                                        {
                                            name: 'from',
                                            type: 'Person',
                                        },
                                        {
                                            name: 'to',
                                            type: 'Person',
                                        },
                                        {
                                            name: 'contents',
                                            type: 'string',
                                        },
                                    ],
                                },
                                primaryType: 'Mail',
                                domain: {
                                    name: 'Ether Mail',
                                    version: '1',
                                    chainId: 11155111,
                                    verifyingContract:
                                        '0xE9D276443CC8eD56e4b660e93759005b362C55a7',
                                },
                                message: {
                                    from: {
                                        name: 'Aditya',
                                        wallet: '0x2D4742c77824E4faFbee5720AB4Aa34bf3602da8',
                                    },
                                    to: {
                                        name: 'Thakkar',
                                        wallet: '0x0fF73A331A49Da82e2517Cb7Cd1f38283ad75251',
                                    },
                                    contents: message,
                                },
                            },
                        ],
                    });
                }
                const response = await axios.post(
                    'http://localhost:3001/sign',
                    {
                        message: message,
                        signature: signatureResponse,
                        signingMethod: signingMethod,
                    }
                );
                setSignature(signatureResponse);
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
            <select
                value={signingMethod}
                onChange={(e) => setSigningMethod(e.target.value)}
            >
                <option value="personal_sign">personal_sign</option>
                <option value="eth_signTypedData_v4">
                    eth_signTypedData_v4
                </option>
            </select>
            <button onClick={handleSignMessage}>Sign Message</button>
            {signature && <div>Signature: {signature}</div>}
        </div>
    );
};

export default App;
