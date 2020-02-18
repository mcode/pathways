import React, { FC } from 'react';
import { render } from '@testing-library/react';
import withConfirmationPopup from 'components/withConfirmationPopup';

const containerText = 'Lorem Ipsum';

const MockComponent: FC = () => {
  return <div>{containerText}</div>;
};

const MockWithConfirmation: FC = withConfirmationPopup(MockComponent);

describe('withConfirmationPopup', () => {
  const { getByText } = render(<MockWithConfirmation />);
  it('renders the wrapped component', () => {
    expect(getByText(containerText)).toBeInTheDocument();
  });
});

// describe('whatever', () => {
//   it('does nothing', () => {
//     console.log('foo');
//   });
// });
