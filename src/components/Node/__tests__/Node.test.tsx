import React from 'react';
import { render } from '@testing-library/react';
import Node from '../Node';

const testState = {
  label: 'Start',
  transitions: []
};

describe('<Node />', () => {
  it('renders a node with text, icon, and correct styles', () => {
    const { container, getByText, getByRole } = render(
      <Node
        icon="test"
        pathwayState={testState}
        isOnPatientPath={true}
        xCoordinate={0}
        yCoordinate={0}
      />
    );

    expect(getByText(testState.label)).toBeVisible();
    expect(getByRole('img')).toBeVisible();

    expect(container.firstChild).toHaveClass('onPatientPath');
    expect(container.firstChild).toHaveStyle(`top: 0px`);
    expect(container.firstChild).toHaveStyle(`left: 0px`);
  });

  it('renders correct background-color when node is not on patient path', () => {
    const { container } = render(
      <Node
        icon="test"
        pathwayState={testState}
        isOnPatientPath={false}
        xCoordinate={0}
        yCoordinate={0}
      />
    );

    expect(container.firstChild).toHaveClass('notOnPatientPath');
  });
});
