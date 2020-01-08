import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import DropDown from '../DropDown';

const label = 'drop down options';
const idText = 'fakeId';
const options = [
  { label: 'cat', value: 'feline' },
  { label: 'dog', value: 'canine' },
  { label: 'lion', value: 'simba' }
];
const selectedValue = options[1];
const myCallback = jest.fn();

describe('<DropDown />', () => {
  it('renders the options', () => {
    const { container, getByLabelText, getAllByText } = render(
      <DropDown
        id={idText}
        options={options}
        label={label}
        visible={true}
        selectedValue={selectedValue}
        setSelectPathway={myCallback}
      />
    );
    expect(getByLabelText(label)).toBeVisible();

    fireEvent.keyDown(getByLabelText(label, { selector: 'input' }), { keyCode: 40 });

    const optionsRendered = container.querySelectorAll('.DropDown__option');
    expect(optionsRendered.length).toEqual(options.length);

    options.forEach(option => {
      expect(getAllByText(option.label)[0]).toBeDefined();
    });
  });

  it('calls the onChange callback when a change occurs', () => {
    const { getByLabelText, getByText } = render(
      <DropDown
        id={idText}
        options={options}
        label={label}
        visible={true}
        onChange={myCallback}
        selectedValue={selectedValue}
        setSelectPathway={myCallback}
      />
    );

    fireEvent.keyDown(getByLabelText(label, { selector: 'input' }), { keyCode: 40 });
    fireEvent.click(getByText('cat'));

    expect(myCallback).toHaveBeenCalledWith({ label: 'cat', value: 'feline' });
  });
});
