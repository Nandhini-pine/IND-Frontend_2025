import React from 'react';
import { Text as RNText } from 'react-native';

const CustomText = (props) => {
  return <RNText {...props} allowFontScaling={false} />;
};

export default CustomText;
