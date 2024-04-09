import React, { useState } from 'react';
import axios from 'axios';
import Web3 from 'web3';

const App = () => {
    const [message, setMessage] = useState('');
    const [signature, setSignature] = useState('');
    const [signingMethod, setSigningMethod] = useState('personal_sign');
    const [decodedSigner, setDecodedSigner] = useState('');
    const [verificationResult, setVerificationResult] = useState('');

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
                                    Message: [{ name: 'message', type: 'string' }],
                                },
                                primaryType: 'Message',
                                domain: {
                                    name: 'Ether Mail',
                                    version: '1',
                                    chainId: 11155111,
                                    verifyingContract:
                                        '0x14FA0721FBBB3A84D49fF66673AC4a08AE4c6aE3',
                                },
                                message: {
                                    message: message,
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

    const handleDecodeSignature = async () => {
        try {
            if (signature && window.ethereum) {
                const accounts = await window.ethereum.request({
                    method: 'eth_requestAccounts',
                });
                const signerAddress = accounts[0];
                const web3 = new Web3(window.ethereum);
                const signer = await web3.eth.personal.ecRecover(
                    message,
                    signature
                );
                setDecodedSigner(signer);
            }
        } catch (error) {
            console.error('Error decoding signature:', error);
        }
    };

    const handleVerifySignature = async () => {
        try {
            if (signature && window.ethereum) {
                const accounts = await window.ethereum.request({
                    method: 'eth_requestAccounts',
                });
                const signerAddress = accounts[0];
                const web3 = new Web3(window.ethereum);

                const contractABIResponse = await axios.get(
                    'http://localhost:3001/contract-abi'
                );
                console.log(contractABIResponse);
                const contractABI = contractABIResponse.data.abi;
                console.log(contractABI);
                const contractAddress =
                    '0x14FA0721FBBB3A84D49fF66673AC4a08AE4c6aE3';

                const contract = new web3.eth.Contract(
                    contractABI,
                    contractAddress,
                );
                console.log(contract);
                const result = await contract.methods
                    .verifySignature(
                        message,
                        signature,
                        signerAddress
                    )
                    .call();

                setVerificationResult(result);
                console.log(accounts);
            }
        } catch (error) {
            console.error('Error verifying signature:', error);
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
            <button
                onClick={handleDecodeSignature}
                disabled={signingMethod !== 'personal_sign'}
            >
                Decode Signer
            </button>
            <button
                onClick={handleVerifySignature}
                disabled={signingMethod !== 'eth_signTypedData_v4'}
            >
                Verify Signature
            </button>
            {signature && <div>Signature: {signature}</div>}
            {decodedSigner && <div>Decoded Signer: {decodedSigner}</div>}
            {verificationResult !== '' && (
                <div>Verification Result: {verificationResult.toString()}</div>
            )}
        </div>
    );
};

export default App;
