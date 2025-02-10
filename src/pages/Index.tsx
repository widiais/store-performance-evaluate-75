
import { ShoppingCart, Smartphone, Box, UserPlus, Key, Bell, Globe, Shield, Moon } from 'lucide-react';
import MetricCard from '@/components/MetricCard';
import MonthlyChart from '@/components/MonthlyChart';
import CustomerRequests from '@/components/CustomerRequests';
import SidePanel from '@/components/SidePanel';
import SetupStore from '@/components/SetupStore';
import SetupChamps from '@/components/SetupChamps';
import SetupCleanliness from '@/components/SetupCleanliness';
import SetupProductQuality from '@/components/SetupProductQuality';
import SetupService from '@/components/SetupService';
import ChampsForm from '@/components/ChampsForm';
import EspForm from '@/components/EspForm';
import { useState } from 'react';
import { Switch } from "@/components/ui/switch";
import ChampReport from '@/components/ChampReport';
import ChampReportDetail from '@/components/ChampReportDetail';
import EspReport from '@/components/EspReport';
import EspReportDetail from '@/components/EspReportDetail';
import { Routes, Route } from 'react-router-dom';

const Index = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <>
            <header className="mb-8">
              <h1 className="text-3xl font-medium mb-2">Dashboard</h1>
              <p className="text-dashboard-muted">Below is an example dashboard created using charts from this plugin</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">