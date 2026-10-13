import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';

function TwoFactorSetup() {
  const { user, enableTwoFactor, verifyTwoFactorSetup, disableTwoFactor } = useAuth();
  const [secret, setSecret] = useState(null);
  const [otpAuthUrl, setOtpAuthUrl] = useState(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleEnableTwoFactor = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await enableTwoFactor();
      setSecret(response.secret);
      setOtpAuthUrl(response.otpauth_url);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to enable two-factor authentication');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifySetup = async (e) => {
    e.preventDefault();

    if (!verificationCode) {
      setError('Please enter the verification code');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await verifyTwoFactorSetup(verificationCode);
      setSuccess('Two-factor authentication has been enabled successfully');
      setSecret(null);
      setOtpAuthUrl(null);
      setVerificationCode('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to verify two-factor authentication');
    } finally {
      setLoading(false);
    }
  };

  const handleDisableTwoFactor = async (e) => {
    e.preventDefault();

    if (!password) {
      setError('Please enter your password');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await disableTwoFactor(password);
      setSuccess('Two-factor authentication has been disabled successfully');
      setPassword('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to disable two-factor authentication');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card p-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Two-Factor Authentication
      </h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
          <button
            className="absolute top-0 bottom-0 right-0 px-4 py-3"
            onClick={() => setError(null)}
          >
            <span className="sr-only">Dismiss</span>
            <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{success}</span>
          <button
            className="absolute top-0 bottom-0 right-0 px-4 py-3"
            onClick={() => setSuccess(null)}
          >
            <span className="sr-only">Dismiss</span>
            <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {user?.twoFactorEnabled ? (
        <div>
          <p className="text-green-600 dark:text-green-400 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Two-factor authentication is currently enabled
          </p>

          <form onSubmit={handleDisableTwoFactor}>
            <div className="mb-4">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Enter your password to disable 2FA
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="input"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn bg-red-600 hover:bg-red-700 text-white"
            >
              {loading ? 'Processing...' : 'Disable Two-Factor Authentication'}
            </button>
          </form>
        </div>
      ) : secret ? (
        <div>
          <p className="mb-4 text-gray-600 dark:text-gray-400">
            Set up two-factor authentication with your authenticator app (like Google Authenticator, Authy, or Microsoft Authenticator).
          </p>

          <div className="mb-6 bg-white p-4 inline-block rounded-md">
            <div className="text-center">
              <p className="mb-2">Use this secret key in your authenticator app:</p>
              <div className="font-mono bg-gray-100 dark:bg-gray-800 p-2 rounded text-center select-all">
                {secret}
              </div>
            </div>
          </div>

          <div className="mb-6">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              After adding to your app, you'll see a 6-digit code that changes every 30 seconds.
            </p>
          </div>

          <form onSubmit={handleVerifySetup}>
            <div className="mb-4">
              <label htmlFor="verificationCode" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Enter the verification code from your app
              </label>
              <input
                type="text"
                id="verificationCode"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="000000"
                required
                className="input"
                maxLength={6}
              />
            </div>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => {
                  setSecret(null);
                  setOtpAuthUrl(null);
                }}
                className="flex-1 btn bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="flex-1 btn btn-primary"
              >
                {loading ? 'Verifying...' : 'Verify and Enable'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div>
          <p className="mb-4 text-gray-600 dark:text-gray-400">
            Two-factor authentication adds an extra layer of security to your account. When enabled, you'll need to enter a verification code from your authenticator app in addition to your password when signing in.
          </p>

          <button
            onClick={handleEnableTwoFactor}
            disabled={loading}
            className="btn btn-primary"
          >
            {loading ? 'Processing...' : 'Enable Two-Factor Authentication'}
          </button>
        </div>
      )}
    </div>
  );
}

export default TwoFactorSetup;
