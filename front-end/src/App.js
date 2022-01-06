import Header from "./compotents/Header";
import OptionList from "./compotents/OptionList";
import OptionRegular from "./compotents/OptionRegular";

function App() {
    return (
        <div>
            <Header />
            <div className="PaneContainer">
                <div className="LeftSide">
                    <OptionList/>
                </div>
                <div className="RightSide">
                    <OptionRegular
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
