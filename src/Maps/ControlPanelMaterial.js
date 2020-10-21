import React, { useState } from 'react';
import { Checkbox, Slider, FormControlLabel, Card, CardContent, Typography } from '@material-ui/core/';
import { withStyles, makeStyles } from '@material-ui/core/styles';


const textColor = 'white';
const accentColor = '#370617'
//const accentColor = 'grey'
//const sliderColor = '#161a1d'
const sliderColor = 'grey'

/********** HELPER FUNCTIONS **********/
const formatTime = time => {
  const date = new Date(time);
  return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
};


/********** CUSTOM CHECKBOX **********/
const CustomCheckbox = withStyles({
  root: {
    paddingLeft: 10,
    color: textColor,
    '&$checked': {
      color: accentColor,
    },
  },
  checked: {},
})((props) => <Checkbox {...props} />);


/********** CUSTOM SLIDER **********/
const CustomSliderStyled = withStyles({
  root: {
    color: sliderColor,
    height: 8,
  },
  thumb: {
    height: 20,
    width: 20,
    backgroundColor: accentColor,
    border: '2px solid currentColor',
    marginTop: -8,
    marginLeft: -12,
    '&:focus, &:hover, &$active': {
      boxShadow: 'inherit',
    },
  },
  active: {},
  valueLabel: {
    left: 'calc(-50% + 4px)',
  },
  track: {
    height: 8,
    borderRadius: 4,
  },
  rail: {
    height: 8,
    borderRadius: 4,
  },
})(Slider);

const CustomSlider = ({ allTime, days, _onChangeDay }) => {
  const [value, setValue] = useState(days);
  const handleChange = (event, newValue) => {
    setValue(newValue);
    _onChangeDay(value)
  };
  return (
    <CustomSliderStyled
      value={value}
      onChange={handleChange}
      //defaultValue={0} 
      disabled={allTime}
      min={0}
      max={days}
      step={1}
    />
  )
}

const CustomCard = (props) => {
  return (
    <div className='custom-card'>{props.children}</div>
  )
}



const ControlPanelMaterial = ({
  startTime,
  endTime,
  onChangeDay,
  allTime,
  onChangeallTime,
  selectMajorEarthquakes,
  selectedTime,
  handleMajorEarthquakes
}) => {

  // find the total number of days we have 
  const day = 24 * 60 * 60 * 1000;
  const days = Math.round((endTime - startTime) / day);
  const _onChangeDay = value => {
    const daysToAdd = value;
    // add selected days to start time to calculate new time
    const newTime = startTime-1 + daysToAdd * day;
    onChangeDay(newTime);
  };

  return (
    <div className="control-panel">
      <CustomCard >
        <CardContent>
          <h2>Earthquakes</h2>
          <p>
            from <b>{formatTime(startTime)}</b> to <b>{formatTime(endTime)}</b>.
        </p>
          <hr />
          <div className="input">

            <FormControlLabel
              control={
                <CustomCheckbox
                  name="allTime"
                  checked={allTime}
                  onChange={evt => onChangeallTime(evt.target.checked)}
                />
              }
              label={
                <label style={{ fontSize: '14px', fontFamily: ['Crimson Text', 'serif'] }}>All Earthquakes</label>}
              labelPlacement="end"
            />

            <FormControlLabel
              control={
                <CustomCheckbox
                  name="major"
                  checked={selectMajorEarthquakes}
                  onChange={evt => handleMajorEarthquakes(evt.target.checked)}
                />
              }
              label={<label style={{ fontSize: '14px', fontFamily: ['Crimson Text', 'serif'] }}>Major Earthquakes</label>}
              labelPlacement="end"
            />

          </div>

          {!allTime ?
            <div className={`input ${(allTime) ? 'disabled' : ''}`}>
              <p>Between {formatTime(startTime)} and {formatTime(selectedTime)}</p>
              <CustomSlider
                allTime={allTime}
                days={days}
                _onChangeDay={_onChangeDay}
              />
            </div>
            : null
          }


        </CardContent>
      </CustomCard>
    </div>
  )
};

export default ControlPanelMaterial;