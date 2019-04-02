import React, { Fragment } from 'react';

export default () => {
    if ('mediaSession' in navigator) {
        return {
            supported: true,
        };
    }


    const message = (
        <Fragment>
            The Media Session API is not supported by your mobile device.
            You will not be able to control playback from your phone&apos;s notification screen.
            {' '}
            <span role="img" aria-label="sad face">😢</span>
        </Fragment>
    );

    return {
        message,
        supported: false,
    };
};
