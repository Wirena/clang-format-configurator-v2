import React from "react";
import styles from "./Error.module.css"


const Error = ({ errorText }) => {
    return (
        <div className={styles.error}>
            <h3 className={styles.error_header}>Something went wrong:</h3>
            <h4 className={styles.error_message}>{errorText}</h4>
        </div>
    )
}

export default Error