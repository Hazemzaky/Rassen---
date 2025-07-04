import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, CircularProgress, Card, CardContent, Snackbar, Alert
} from '@mui/material';
import axios from 'axios';

interface Balance {
  account: string;
  name: string;
  code: string;
  type: string;
  debit: number;
  credit: number;
  balance: number;
}

const TrialBalancePage: React.FC = () => {
  const [balances, setBalances] = useState<Balance[]>([]);
  const [totalDebit, setTotalDebit] = useState(0);
  const [totalCredit, setTotalCredit] = useState(0);
  const [balanced, setBalanced] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTrialBalance();
  }, []);

  const fetchTrialBalance = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/accounts/trial-balance', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = res.data;
      if (
        data &&
        typeof data === 'object' &&
        Array.isArray((data as any).balances) &&
        typeof (data as any).totalDebit === 'number' &&
        typeof (data as any).totalCredit === 'number' &&
        typeof (data as any).balanced === 'boolean'
      ) {
        const safeData = data as { balances: Balance[]; totalDebit: number; totalCredit: number; balanced: boolean };
        setBalances(safeData.balances);
        setTotalDebit(safeData.totalDebit);
        setTotalCredit(safeData.totalCredit);
        setBalanced(safeData.balanced);
      } else {
        setBalances([]);
        setTotalDebit(0);
        setTotalCredit(0);
        setBalanced(false);
        setError('Unexpected response from server');
        console.error('Expected balances array, got:', data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch trial balance');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box p={3}>
      <Typography variant="h4" mb={3}>Trial Balance</Typography>
      <Card sx={{ mb: 3, background: balanced ? '#388e3c' : '#d32f2f', color: '#fff' }}>
        <CardContent>
          <Typography variant="h6">Books {balanced ? 'are' : 'are NOT'} balanced</Typography>
          <Typography>Total Debit: {totalDebit}</Typography>
          <Typography>Total Credit: {totalCredit}</Typography>
        </CardContent>
      </Card>
      <Paper sx={{ p: 2, overflowX: 'auto' }}>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer>
            <Table stickyHeader>
              <TableHead>
                <TableRow sx={{ background: '#f5f5f5' }}>
                  <TableCell>Account Name</TableCell>
                  <TableCell>Code</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Debit</TableCell>
                  <TableCell>Credit</TableCell>
                  <TableCell>Net Balance</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {balances.map((b, idx) => (
                  <TableRow key={b.account} sx={{ background: idx % 2 === 0 ? '#fafafa' : '#fff' }}>
                    <TableCell>{b.name}</TableCell>
                    <TableCell>{b.code}</TableCell>
                    <TableCell>{b.type}</TableCell>
                    <TableCell>{b.debit}</TableCell>
                    <TableCell>{b.credit}</TableCell>
                    <TableCell>{b.balance}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      </Paper>
      <Snackbar
        open={!!error}
        autoHideDuration={3000}
        onClose={() => setError('')}
        message={error}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      />
    </Box>
  );
};

export default TrialBalancePage; 
