import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
  SafeAreaView,
  KeyboardAvoidingView
} from 'react-native';
import { StatusBar } from 'expo-status-bar';

// Default Backend Base URL (Cloud Host: 119.59.102.161 Port: 3103)
const DEFAULT_API_BASE = 'http://119.59.102.161:3103';

export default function App() {
  // Navigation / Auth State
  const [token, setToken] = useState(null);
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('password123');
  const [apiBaseUrl, setApiBaseUrl] = useState(DEFAULT_API_BASE);
  const [showConfig, setShowConfig] = useState(false);

  // Employee CRUD State
  const [employees, setEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [position, setPosition] = useState('');
  const [salary, setSalary] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Phase 2: K-Means State
  const [clusters, setClusters] = useState([]);
  const [analyzingClusters, setAnalyzingClusters] = useState(false);
  const [clusterError, setClusterError] = useState('');

  // Cross-platform Alert Helper
  const displayAlert = (title, message) => {
    if (Platform.OS === 'web') {
      window.alert(`${title}\n${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  // Cross-platform Confirmation Dialog
  const displayConfirm = (title, message, onConfirm) => {
    if (Platform.OS === 'web') {
      if (window.confirm(`${title}\n${message}`)) {
        onConfirm();
      }
    } else {
      Alert.alert(title, message, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: onConfirm }
      ]);
    }
  };

  // ==========================================
  // Phase 1.1: Authentication (Login)
  // ==========================================
  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      displayAlert('Login Error', 'Please enter both username and password.');
      return;
    }

    try {
      const response = await fetch(`${apiBaseUrl}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setToken(data.token);
        fetchEmployees(); // Automatically load employees upon login
      } else {
        displayAlert('Login Failed', data.message || 'Invalid username or password.');
      }
    } catch (error) {
      displayAlert('Connection Error', `Cannot connect to server at ${apiBaseUrl}. Ensure the backend server is running.`);
    }
  };

  const handleLogout = () => {
    setToken(null);
    setEmployees([]);
    setClusters([]);
    setName('');
    setPosition('');
    setSalary('');
    setFormError('');
  };

  // ==========================================
  // Phase 1.2: CRUD Operations
  // ==========================================

  // Fetch all employees
  const fetchEmployees = async () => {
    setLoadingEmployees(true);
    try {
      const response = await fetch(`${apiBaseUrl}/api/employees`);
      const data = await response.json();
      if (Array.isArray(data)) {
        setEmployees(data);
      } else if (data.data && Array.isArray(data.data)) {
        setEmployees(data.data);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
    } finally {
      setLoadingEmployees(false);
    }
  };

  // Add new employee with Client-Side Validation
  const handleAddEmployee = async () => {
    setFormError('');

    // Client-side Validation: prevent submission if fields are empty
    if (!name.trim() || !position.trim() || !salary.trim()) {
      setFormError('All fields (Name, Position, Salary) are required.');
      displayAlert('Validation Error', 'All fields (Name, Position, Salary) are required.');
      return;
    }

    const numericSalary = Number(salary.trim());
    if (isNaN(numericSalary) || numericSalary <= 0) {
      setFormError('Salary must be a valid positive number.');
      displayAlert('Validation Error', 'Salary must be a valid positive number.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`${apiBaseUrl}/api/employees`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          position: position.trim(),
          salary: numericSalary
        })
      });

      const data = await response.json();

      if (response.status === 201 || (response.ok && data.success)) {
        // Clear input form
        setName('');
        setPosition('');
        setSalary('');
        setFormError('');
        // Automatically update UI
        fetchEmployees();
      } else {
        displayAlert('Error', data.message || 'Failed to add employee.');
      }
    } catch (error) {
      displayAlert('Error', 'Unable to reach backend API.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle Employee Status
  const handleToggleStatus = async (id) => {
    try {
      const response = await fetch(`${apiBaseUrl}/api/employees/${id}/status`, {
        method: 'PUT'
      });
      const data = await response.json();
      if (response.ok && data.success) {
        // Automatically update UI
        setEmployees(prev =>
          prev.map(emp => (emp.id === id ? data.employee : emp))
        );
      } else {
        displayAlert('Error', data.message || 'Failed to toggle status.');
      }
    } catch (error) {
      displayAlert('Error', 'Unable to reach backend API.');
    }
  };

  // Delete Employee with Confirmation Alert
  const handleDeleteEmployee = (id, empName) => {
    displayConfirm(
      'Confirm Deletion',
      `Are you sure you want to delete employee "${empName}"?`,
      async () => {
        try {
          const response = await fetch(`${apiBaseUrl}/api/employees/${id}`, {
            method: 'DELETE'
          });
          const data = await response.json();
          if (response.ok && data.success) {
            // Automatically update UI
            setEmployees(prev => prev.filter(emp => emp.id !== id));
          } else {
            displayAlert('Error', data.message || 'Failed to delete employee.');
          }
        } catch (error) {
          displayAlert('Error', 'Unable to reach backend API.');
        }
      }
    );
  };

  // ==========================================
  // Phase 2: K-Means Salary Analytics
  // ==========================================
  const handleAnalyzeSalary = async () => {
    setAnalyzingClusters(true);
    setClusterError('');
    try {
      const response = await fetch(`${apiBaseUrl}/api/employees/salary-clusters`);
      const data = await response.json();

      if (response.ok && data.success) {
        setClusters(data.clusters || []);
      } else {
        setClusterError(data.message || 'Failed to calculate clusters.');
        displayAlert('Error', data.message || 'Failed to calculate clusters.');
      }
    } catch (error) {
      setClusterError('Cannot reach backend clustering service.');
      displayAlert('Error', 'Cannot reach backend clustering service.');
    } finally {
      setAnalyzingClusters(false);
    }
  };

  // ==========================================
  // Render: Login Screen
  // ==========================================
  if (!token) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="dark" />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.centerContainer}
        >
          <View style={styles.loginCard}>
            <View style={styles.loginHeader}>
              <View style={styles.badgeContainer}>
                <Text style={styles.badgeText}>Internet Programming Final 2026</Text>
              </View>
              <Text style={styles.title}>HR Manager & Salary Analytics</Text>
              <Text style={styles.subtitle}>Student: Kanwit Voottikulsin (6730251417)</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Username</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter username (admin)"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter password (password123)"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            <TouchableOpacity style={styles.primaryButton} onPress={handleLogin}>
              <Text style={styles.primaryButtonText}>Sign In</Text>
            </TouchableOpacity>

            <View style={styles.apiConfigBox}>
              <TouchableOpacity onPress={() => setShowConfig(!showConfig)}>
                <Text style={styles.apiConfigToggle}>
                  {showConfig ? 'Hide Server Configuration' : '⚙️ Server URL Settings'}
                </Text>
              </TouchableOpacity>
              {showConfig && (
                <View style={{ marginTop: 8 }}>
                  <Text style={styles.helperText}>API Base URL:</Text>
                  <TextInput
                    style={[styles.input, { fontSize: 13, paddingVertical: 6 }]}
                    value={apiBaseUrl}
                    onChangeText={setApiBaseUrl}
                    placeholder="http://119.59.102.161:3103"
                  />
                  <View style={{ flexDirection: 'row', gap: 8, marginTop: 6 }}>
                    <TouchableOpacity
                      onPress={() => setApiBaseUrl('http://119.59.102.161:3103')}
                      style={[styles.smallPill, apiBaseUrl.includes('119.59.102.161') && styles.smallPillActive]}
                    >
                      <Text style={styles.smallPillText}>Cloud Server (3103)</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => setApiBaseUrl('http://localhost:3103')}
                      style={[styles.smallPill, apiBaseUrl.includes('localhost') && styles.smallPillActive]}
                    >
                      <Text style={styles.smallPillText}>Localhost (3103)</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // ==========================================
  // Render: Dashboard Screen (CRUD & Analytics)
  // ==========================================
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* App Bar / Header */}
        <View style={styles.dashboardHeader}>
          <View>
            <Text style={styles.headerTitle}>HR Management Dashboard</Text>
            <Text style={styles.headerSubtitle}>Kanwit Voottikulsin (std6730251417) | Section 870</Text>
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        {/* Phase 2: Salary Clustering Section */}
        <View style={styles.card}>
          <View style={styles.sectionHeaderRow}>
            <View>
              <Text style={styles.sectionTitle}>Phase 2: Salary Structure Analytics</Text>
              <Text style={styles.sectionSubtitle}>1D K-Means Clustering (k=3 Tiers)</Text>
            </View>
            <TouchableOpacity
              style={[styles.analyticsButton, analyzingClusters && styles.buttonDisabled]}
              onPress={handleAnalyzeSalary}
              disabled={analyzingClusters}
            >
              <Text style={styles.analyticsButtonText}>
                {analyzingClusters ? 'Analyzing...' : 'Analyze Salary Structure'}
              </Text>
            </TouchableOpacity>
          </View>

          {analyzingClusters && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#4F46E5" />
              <Text style={styles.loadingText}>Running 1D K-Means Clustering Algorithm...</Text>
            </View>
          )}

          {clusterError ? (
            <Text style={styles.errorBanner}>{clusterError}</Text>
          ) : null}

          {clusters.length > 0 && !analyzingClusters && (
            <View style={styles.clusterGrid}>
              {clusters.map((cluster, idx) => (
                <View key={idx} style={[styles.clusterCard, styles[`tierBorder${idx + 1}`]]}>
                  <View style={[styles.tierBadge, styles[`tierBadge${idx + 1}`]]}>
                    <Text style={styles.tierBadgeText}>{cluster.group}</Text>
                  </View>
                  <Text style={styles.clusterCentroidLabel}>Centroid Base Salary</Text>
                  <Text style={styles.clusterCentroidValue}>
                    ฿{Number(cluster.centroid).toLocaleString()}
                  </Text>
                  <View style={styles.clusterCountBadge}>
                    <Text style={styles.clusterCountText}>
                      👥 {cluster.count} {cluster.count === 1 ? 'Employee' : 'Employees'}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Phase 1: Add New Employee Form */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Phase 1: Add New Employee Record</Text>
          <Text style={styles.sectionSubtitle}>Input validation enforces name, position, and positive salary</Text>

          {formError ? <Text style={styles.errorBanner}>{formError}</Text> : null}

          <View style={styles.formGrid}>
            <View style={styles.formCol}>
              <Text style={styles.label}>Full Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Somchai Prasert"
                value={name}
                onChangeText={setName}
              />
            </View>

            <View style={styles.formCol}>
              <Text style={styles.label}>Position *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Backend Developer"
                value={position}
                onChangeText={setPosition}
              />
            </View>

            <View style={styles.formCol}>
              <Text style={styles.label}>Monthly Salary (THB) *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 35000"
                value={salary}
                onChangeText={setSalary}
                keyboardType="numeric"
              />
            </View>
          </View>

          <TouchableOpacity
            style={[styles.submitButton, isSubmitting && styles.buttonDisabled]}
            onPress={handleAddEmployee}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.submitButtonText}>+ Add Employee to System</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Phase 1: Employee Directory List */}
        <View style={styles.card}>
          <View style={styles.sectionHeaderRow}>
            <View>
              <Text style={styles.sectionTitle}>Employee Directory ({employees.length})</Text>
              <Text style={styles.sectionSubtitle}>Toggle status between Active & On Leave, or remove records</Text>
            </View>
            <TouchableOpacity style={styles.refreshButton} onPress={fetchEmployees}>
              <Text style={styles.refreshButtonText}>🔄 Refresh</Text>
            </TouchableOpacity>
          </View>

          {loadingEmployees ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#4F46E5" />
              <Text style={styles.loadingText}>Fetching employee records...</Text>
            </View>
          ) : employees.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No employee records found in system.</Text>
            </View>
          ) : (
            <View style={styles.employeeList}>
              {employees.map((emp) => (
                <View key={emp.id} style={styles.employeeRow}>
                  <View style={styles.employeeInfo}>
                    <View style={styles.employeeNameRow}>
                      <Text style={styles.employeeName}>{emp.name}</Text>
                      <View
                        style={[
                          styles.statusBadge,
                          emp.status === 'Active' ? styles.statusActive : styles.statusOnLeave
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusText,
                            emp.status === 'Active' ? styles.statusTextActive : styles.statusTextOnLeave
                          ]}
                        >
                          {emp.status}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.employeePosition}>{emp.position}</Text>
                    <Text style={styles.employeeSalary}>
                      Salary: ฿{Number(emp.salary).toLocaleString()}
                    </Text>
                  </View>

                  <View style={styles.actionButtons}>
                    <TouchableOpacity
                      style={[
                        styles.toggleButton,
                        emp.status === 'Active' ? styles.toggleOnLeave : styles.toggleActive
                      ]}
                      onPress={() => handleToggleStatus(emp.id)}
                    >
                      <Text style={styles.toggleButtonText}>
                        {emp.status === 'Active' ? 'Set On Leave' : 'Set Active'}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => handleDeleteEmployee(emp.id, emp.name)}
                    >
                      <Text style={styles.deleteButtonText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ==========================================
// Styling
// ==========================================
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F3F4F6'
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40
  },
  loginCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 3
  },
  loginHeader: {
    alignItems: 'center',
    marginBottom: 20
  },
  badgeContainer: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8
  },
  badgeText: {
    color: '#4F46E5',
    fontSize: 12,
    fontWeight: '600'
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center'
  },
  subtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'center'
  },
  dashboardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827'
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2
  },
  logoutButton: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8
  },
  logoutButtonText: {
    color: '#DC2626',
    fontWeight: '600',
    fontSize: 12
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    flexWrap: 'wrap',
    gap: 8
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937'
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2
  },
  inputGroup: {
    marginBottom: 14
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 14,
    backgroundColor: '#F9FAFB',
    color: '#111827'
  },
  primaryButton: {
    backgroundColor: '#4F46E5',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600'
  },
  analyticsButton: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8
  },
  analyticsButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600'
  },
  buttonDisabled: {
    opacity: 0.6
  },
  clusterGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 12
  },
  clusterCard: {
    flex: 1,
    minWidth: 140,
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    padding: 14,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  tierBorder1: {
    borderLeftColor: '#10B981'
  },
  tierBorder2: {
    borderLeftColor: '#3B82F6'
  },
  tierBorder3: {
    borderLeftColor: '#8B5CF6'
  },
  tierBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginBottom: 8
  },
  tierBadge1: { backgroundColor: '#D1FAE5' },
  tierBadge2: { backgroundColor: '#DBEAFE' },
  tierBadge3: { backgroundColor: '#EDE9FE' },
  tierBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1F2937'
  },
  clusterCentroidLabel: {
    fontSize: 11,
    color: '#6B7280',
    textTransform: 'uppercase'
  },
  clusterCentroidValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
    marginTop: 2
  },
  clusterCountBadge: {
    marginTop: 8
  },
  clusterCountText: {
    fontSize: 12,
    color: '#4B5563',
    fontWeight: '500'
  },
  formGrid: {
    marginTop: 8,
    gap: 10
  },
  formCol: {
    flex: 1
  },
  submitButton: {
    backgroundColor: '#10B981',
    paddingVertical: 11,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600'
  },
  refreshButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#F3F4F6'
  },
  refreshButtonText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500'
  },
  employeeList: {
    marginTop: 8,
    gap: 10
  },
  employeeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    flexWrap: 'wrap',
    gap: 10
  },
  employeeInfo: {
    flex: 1,
    minWidth: 180
  },
  employeeNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4
  },
  employeeName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827'
  },
  employeePosition: {
    fontSize: 13,
    color: '#4B5563',
    marginBottom: 2
  },
  employeeSalary: {
    fontSize: 13,
    fontWeight: '600',
    color: '#059669'
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6
  },
  statusActive: {
    backgroundColor: '#D1FAE5'
  },
  statusOnLeave: {
    backgroundColor: '#FEF3C7'
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700'
  },
  statusTextActive: {
    color: '#065F46'
  },
  statusTextOnLeave: {
    color: '#92400E'
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8
  },
  toggleButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6
  },
  toggleActive: {
    backgroundColor: '#D1FAE5'
  },
  toggleOnLeave: {
    backgroundColor: '#FEF3C7'
  },
  toggleButtonText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1F2937'
  },
  deleteButton: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6
  },
  deleteButtonText: {
    color: '#DC2626',
    fontSize: 11,
    fontWeight: '600'
  },
  loadingContainer: {
    paddingVertical: 20,
    alignItems: 'center'
  },
  loadingText: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 8
  },
  emptyState: {
    paddingVertical: 24,
    alignItems: 'center'
  },
  emptyStateText: {
    color: '#9CA3AF',
    fontSize: 14
  },
  errorBanner: {
    backgroundColor: '#FEE2E2',
    color: '#B91C1C',
    padding: 10,
    borderRadius: 8,
    fontSize: 13,
    marginTop: 8,
    marginBottom: 8
  },
  apiConfigBox: {
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB'
  },
  apiConfigToggle: {
    fontSize: 12,
    color: '#4F46E5',
    textAlign: 'center',
    fontWeight: '500'
  },
  helperText: {
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 4
  },
  smallPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: '#E5E7EB'
  },
  smallPillActive: {
    backgroundColor: '#C7D2FE'
  },
  smallPillText: {
    fontSize: 11,
    color: '#1F2937'
  }
});
