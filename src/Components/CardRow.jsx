import * as React from 'react';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import PropTypes from 'prop-types';
import './CardRow.css';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import { Height } from '@mui/icons-material';

export default function CardRow({ el }) {
  function TabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`simple-tabpanel-${index}`}
        aria-labelledby={`simple-tab-${index}`}
        {...other}
      >
        {value === index && (
          <Box sx={{ p: 3 }}>
            <Typography>{children}</Typography>
          </Box>
        )}
      </div>
    );
  }

  TabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.number.isRequired,
    value: PropTypes.number.isRequired,
  };

  function a11yProps(index) {
    return {
      id: `simple-tab-${index}`,
      'aria-controls': `simple-tabpanel-${index}`,
    };
  }

  const [value, setValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  let {
    production_name,
    production_year,
    production_description,
    production_ranking_number,
    production_image_path,
    genre_names,
    demographic_name,
    production_number_chapters,
  } = el;

  return (
    <div className="mycard">
      <Card sx={{ display: 'flex' }}>
        <CardMedia
          component="img"
          sx={{ width: 150, border: '4px solid white' }}
          image={`https://www.animecream.com${production_image_path}`}
          alt="Live from space album cover"
        />
        <Box sx={{ width: '100%' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
              <Tab label="Info" {...a11yProps(0)} />
              <Tab label="Description" {...a11yProps(1)} />
            </Tabs>
          </Box>
          <TabPanel value={value} index={0}>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flex: '1 0 auto' }}>
                <Typography component="div" variant="h5">
                  {production_name}
                </Typography>
                <Typography variant="body2" color="text.secondary" component="div">
                  <Button variant="text" size="small">
                    {production_year}
                  </Button>
                  <Button variant="text" size="small">
                    {`${production_number_chapters} episodes`}
                  </Button>
                  <Button variant="text" size="small">
                    {demographic_name}
                  </Button>
                  {genre_names.split(',').map((genre) => (
                    <Button key={genre} variant="text" size="small">
                      {genre}
                    </Button>
                  ))}
                </Typography>
              </CardContent>
            </Box>
          </TabPanel>
          <TabPanel value={value} index={1}>
            <Typography variant="body2" color="text.secondary" component="div">
              {production_description}
            </Typography>
          </TabPanel>
        </Box>
      </Card>
    </div>
  );
}
