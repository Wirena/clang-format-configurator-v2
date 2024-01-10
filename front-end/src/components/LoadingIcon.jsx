import styles from "./LoadingIcon.module.css"
import React from "react";

class LoadingIcon extends React.Component {

    constructor() {
        super();
        this.loadingState = "loading";
        window.loadingIcon = this;
    }

    setLoadingState(state) {
        this.loadingState = state
        this.forceUpdate()
    }

    render() {
        let image;
        if (this.loadingState === "loading")
            image = (<img className={styles.loading_icon} alt="loading" src="loadingIcon.gif" />);
        else if (this.loadingState === "success")
            image = (<img className={styles.loading_icon} alt="loading" src="./loadingFinishedIcon.svg" />);
        else if (this.loadingState === "error")
            image = (<img className={styles.loading_icon} alt="loading" src="./loadingFailed.svg" />);
        else {
            console.error("LoadingIcon.jsx: Invalid state value - " + this.loadingState)
            image = (<span></span>)
        }
        return (<span>{image}</span>)
    }
}



export default LoadingIcon;