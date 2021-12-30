import React from 'react';


const Option = ({optionTitle, optionInfo,optionList}) => {
    return (
        <div className='Option'>
            <span>
                <h3>{optionTitle}</h3>
            </span>
            <span>
                <select>{
                    optionList.map( (x,y) => 
                    <option key={y}>{x}</option> )
                }</select>
            </span>
        </div>
    );
};

export default Option;