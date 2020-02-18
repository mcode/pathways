import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import ActionButton from '../ActionButton';

const buttonText = 'Accept';
const mockCallback = jest.fn();

describe('<ActionButton />', () => {
  it('calls the onClick callback when clicked', () => {
    const { getByText } = render(
      <ActionButton size="large" type="accept" onClick={mockCallback} />
    );
    expect(getByText(buttonText)).toBeVisible();
    fireEvent.click(getByText(buttonText));
    expect(mockCallback).toHaveBeenCalled();
  });
});
