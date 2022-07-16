import React from 'react';
import styles from './Header.module.css'

const Header = ({ autoFormat, onAutoFormatChange, darkTheme, onDarkThemeChange, onUpdate, onDownload, onUpload }) => {
  return (
    <header className={styles.header}>
      <h2 className={styles.title_text}>clang-format configurator v2</h2>
      <span>
        <input
          className={styles.checkbox} type={"checkbox"}
          id={"autoupdate"} defaultChecked={autoFormat}
          onChange={(event) => onAutoFormatChange(event.currentTarget.checked)}
        />
        <label className={styles.label}>Autoformat on changes</label>
        <button className={styles.button} onClick={onUpdate}>
          Format
        </button>
        <button className={styles.button} onClick={onDownload}>
          Download
        </button>
        <button className={styles.button} onClick={onUpload}>
          Upload
        </button>
        <button className={styles.button}
          onClick={() => window.open("https://github.com/Wirena/clang-format-configurator-v2#user-guide",
            '_blank').focus()}>
          Guide
        </button>
        <button className={styles.button} onClick={onDarkThemeChange}>
          {darkTheme ? "White Theme" : " DarkTheme"}
        </button>
        <button
          className={styles.button}
          onClick={() => window.open("https://github.com/Wirena/clang-format-configurator-v2",
            '_blank').focus()}>
        Contribute</button>
      </span>
    </header>
  )
}

export default Header;