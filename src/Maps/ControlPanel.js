import React from 'react';


const formatTime = time => {
  const date = new Date(time);
  return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
};

const ControlPanel = ({
  startTime,
  endTime,
  onChangeDay,
  allTime,
  onChangeallTime,
  selectedTime
}) => {

  // find the total number of days we have 
  const day = 24 * 60 * 60 * 1000;
  const days = Math.round((endTime - startTime) / day);
  const _onChangeDay = evt => {
    console.log(evt.target.value)
    const daysToAdd = evt.target.value;
    // add selected days to start time to calculate new time
    const newTime = startTime + daysToAdd * day;
    onChangeDay(newTime);
  };

  return (
      <div className="control-panel">
        <h3>Earthquakes</h3>
        <p>
          from <b>{formatTime(startTime)}</b> to <b>{formatTime(endTime)}</b>.
        </p>
        <hr />
        <div className="input">
          <label>All Days</label>
          <input
            type="checkbox"
            name="allTime"
            checked={allTime}
            onChange={evt => onChangeallTime(evt.target.checked)}
          />
        </div>
        <div className={`input ${allTime ? 'disabled' : ''}`}>
          <label>Each Day: {formatTime(selectedTime)}</label>
          <input
            type="range"
            disabled={allTime}
            min={1}
            max={days}
            step={1}
            onChange={_onChangeDay}
          />
        </div>
      </div>
  )
};

export default ControlPanel;