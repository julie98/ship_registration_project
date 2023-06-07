import React from 'react';
import { GoogleLogout } from 'react-google-login';

const clientId = '393287999576-ppjv4ronusaiie2hpspifkj4f3hueco0.apps.googleusercontent.com';

function LogoutGoogle() {
    const onSuccess = () => {
        alert('Logout made successfully!');
    };

    return (
        <div>
            <GoogleLogout
                clientId={clientId}
                buttonText='Logout'
                onLogoutSuccess={onSuccess}
            ></GoogleLogout>
        </div>
    );
}

export default LogoutGoogle;