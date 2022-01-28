import Header from "./components/Header";
import OptionList from "./components/OptionList";
import optionsConfig from "./components/options.json";
import Option from "./components/Option";

function App() {
    return (
        <div>
            <Header />
            <div className="pane_container">
                <section className="left_side">
                    <OptionList />
                </section>
                <section className="right_side">
                    <Option option={optionsConfig["clang-format-11"][0]} />
                    <hr />
                    <Option option={optionsConfig["clang-format-11"][9]} />
                </section>
            </div>
        </div>
    );
}

export default App;
