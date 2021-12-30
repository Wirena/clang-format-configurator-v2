import './App.css';
import Header from './compotents/Header';
import Option from './compotents/Option';

function App() {
  return (
    <div>
      <Header/>
      <Option optionTitle={"Title"}  optionInfo={"text"} optionList={[1,2,3,43]}/>
    </div>
  );
}

export default App;
