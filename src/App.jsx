import './App.css';
import Header from './Header.jsx';
import CountDownEnd from './CountDownEnd';
import CrudApi from './Components/CrudApi';

import * as React from 'react';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Unstable_Grid2';

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  color: theme.palette.text.secondary,
}));

export default function BasicGrid() {
  return (
    <Box sx={{ flexGrow: 1 }}>
      <Grid container spacing={2}>
        <Grid xs={12}>
          <Header />
        </Grid>
        <Grid xs={12}>
          <Item>{/* <CountDownEnd /> */}</Item>
        </Grid>
        <Grid xs={12} md={8}>
          <Item>
            <CrudApi />
          </Item>
        </Grid>
        <Grid xs={12} md={4}>
          <Item>hola</Item>
        </Grid>
      </Grid>
    </Box>
  );
}
