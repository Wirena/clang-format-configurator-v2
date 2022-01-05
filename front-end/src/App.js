import "./App.css";
import Header from "./compotents/Header";
import Option from "./compotents/Option";
import OptionList from "./compotents/OptionList";

function App() {
    return (
        <div>
            <Header />
            <div className="PaneContainer">
                <div className="LeftSide">
                    <OptionList/>
                </div>
                <div className="RightSide">
                    <Option
                        optionTitle={"Title"}
                        optionInfo={"text"}
                        optionList={[1, 2, 3, 43]}
                    />
                </div>
            </div>
        </div>
    );
}

export default App;
