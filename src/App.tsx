import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { MantineProvider, AppShell, Header, Group, Button, Container } from '@mantine/core';
import { CookbookScreen } from './screens/CookbookScreen';
import { PlanningScreen } from './screens/PlanningScreen';
import { ExecutionScreen } from './screens/ExecutionScreen';
import { theme } from './theme';
import '@mantine/core/styles.css';

function App() {
  return (
    <MantineProvider theme={theme} defaultColorScheme="light">
      <BrowserRouter>
        <AppShell
          header={{ height: 60 }}
          padding="md"
        >
          <AppShell.Header>
            <Container size="lg" h="100%">
              <Group h="100%" justify="space-between">
                <Group gap="lg">
                  <Button 
                    component={Link} 
                    to="/" 
                    variant="subtle" 
                    size="md"
                    fw={600}
                  >
                    Cookbook
                  </Button>
                  <Button 
                    component={Link} 
                    to="/planning" 
                    variant="subtle"
                    size="md"
                    fw={600}
                  >
                    Planning
                  </Button>
                  <Button 
                    component={Link} 
                    to="/execution" 
                    variant="subtle"
                    size="md"
                    fw={600}
                  >
                    Today's Meals
                  </Button>
                </Group>
              </Group>
            </Container>
          </AppShell.Header>

          <AppShell.Main>
            <Routes>
              <Route path="/" element={<CookbookScreen />} />
              <Route path="/planning" element={<PlanningScreen />} />
              <Route path="/execution" element={<ExecutionScreen />} />
            </Routes>
          </AppShell.Main>
        </AppShell>
      </BrowserRouter>
    </MantineProvider>
  );
}

export default App;