import React from 'react';

const Header = (props) => {
    return (
        <div className="Header">
            <span><h2>clang-format configurator v2</h2></span>
            <span>
                <button>Contribute</button>
                <button>Download</button>
                <button>Upload</button>
            </span>
        </div>
    )
}

export default Header;