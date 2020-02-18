import React, { FC } from 'react';
import { render, fireEvent } from '@testing-library/react';
import withConfirmationPopup from 'components/withConfirmationPopup';

const containerText = 'Lorem Ipsum';
const popupText = 'Are you sure?';

const MockComponent: FC = () => {
  return <div>{containerText}</div>;
};

const MockWithConfirmation: FC = withConfirmationPopup(MockComponent);

describe('withConfirmationPopup', () => {
  it('renders the wrapped component', () => {
    const { getByText } = render(<MockWithConfirmation />);
    expect(getByText(containerText)).toBeInTheDocument();
  });

  it('renders the popup when clicked', () => {
    const { getByText, queryByText } = render(<MockWithConfirmation />);
    expect(queryByText(popupText)).toBeNull();
    fireEvent.click(getByText(containerText));
    expect(queryByText(popupText)).not.toBeNull();
    expect(getByText(popupText)).toBeInTheDocument();
  });
});
