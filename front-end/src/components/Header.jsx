import React from 'react';
import styles from './Header.module.css'

const Header = ({ autoUpdate, onAutoUpdateChange, onUpdate }) => {

    return (
        <header className={styles.header}>
            <h2 className={styles.title_text}>clang-format configurator v2</h2>
            <span>
                <input className={styles.checkbox} type={"checkbox"}
                    id={"autoupdate"} defaultChecked={autoUpdate}
                    onChange={(event) => onAutoUpdateChange(event.currentTarget.checked)}
                />
                <label>Autoformat on changes</label>
                {autoUpdate ? null : <button>Update</button>}
                
                <button type={"button"}>
                    Download
                </button>
                <button type={"button"}>
                    Upload
                </button>
                <button type={"button"}>
                    Dark Theme
                </button>
                <button
                    type={"button"}
                    onClick={() => window.open("https://github.com/Wirena/clang-format-configurator-v2", '_blank').focus()}
                >Contribute</button>
            </span>
        </header>
    )
}

export default Header;