import React from 'react';
import styles from './Header.module.css'

const Header = () => {
    return (
        <header className={styles.header}>
            <h2 className={styles.title_text}>clang-format configurator v2</h2>
            <span>
                <button>Contribute</button>
                <button>Download</button>
                <button>Upload</button>
                <button>Dark Theme</button>
            </span>
        </header>
    )
}

export default Header;