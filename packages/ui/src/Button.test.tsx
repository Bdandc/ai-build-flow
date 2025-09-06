import React from 'react';
import { render, screen } from '@testing-library/react';
import { Button } from './Button';

test('renders default label', () => {
  render(<Button />);
  expect(screen.getByText('Click')).toBeTruthy();
});
