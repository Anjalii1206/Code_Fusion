import React from 'react';
import { Avatar, Box, Text } from '@chakra-ui/react';

function User({ username }) {
  return (
    <Box display="flex" alignItems="center" flexWrap="wrap" gap="10px" padding="7px">
      <Avatar name={username} />
      <Text>{username}</Text>
    </Box>
  );
}

export default User;
