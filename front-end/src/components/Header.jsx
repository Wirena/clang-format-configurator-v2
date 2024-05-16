import React from 'react';
import styles from './Header.module.css'



const Header = ({ autoFormat, onAutoFormatChange, darkTheme, onDarkThemeChange, onUpdate, onConfigFile }) => {
  return (
    <header className={styles.header}>
      <h2 className={styles.title_text}>clang-format configurator v2</h2>
      <span>
        <input
          className={styles.checkbox} type="checkbox"
          id="autoupdate" defaultChecked={autoFormat}
          onChange={(event) => onAutoFormatChange(event.currentTarget.checked)}
        />
        <label className={styles.label} htmlFor="autoupdate">Autoformat on changes</label>
        <button className={styles.button} onClick={onUpdate}>
          Format
        </button>
        <button className={styles.button} onClick={onConfigFile}>
          Config File
        </button>
        <button className={styles.button}
          onClick={() => window.open("https://github.com/Wirena/clang-format-configurator-v2#user-guide",
            '_blank').focus()}>
          Guide
        </button>
        <button className={styles.button} id={styles.theme_button} onClick={onDarkThemeChange}>
          {darkTheme ? "White Theme" : "Dark Theme"}
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