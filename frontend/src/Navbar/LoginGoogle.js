import React from 'react';
import { GoogleLogin } from 'react-google-login';

const clientId = '393287999576-ppjv4ronusaiie2hpspifkj4f3hueco0.apps.googleusercontent.com';

function LoginGoogle() {
    const onSuccess = (res) => {
        console.log('[Login Success] currentUser:', res.profileObj);
    };

    const onFailure = (res) => {
        console.log('[Login failed] res:', res);
    };

    return (
        <div>
            <GoogleLogin
                clientId={clientId}
                buttonText='Login '
                onSuccess={onSuccess}
                onFailure={onFailure}
                coockiePolicy={'single-host-origin'}
                style={{ marginTop: '100px' }}
                isSignedIn={true}
            />
        </div>
    );
}

export default LoginGoogle;