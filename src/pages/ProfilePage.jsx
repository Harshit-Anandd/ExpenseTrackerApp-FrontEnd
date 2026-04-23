import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CURRENCY_OPTIONS, TIMEZONE_OPTIONS } from "@/lib/constants";
import { useAuth } from "@/contexts/AuthContext";
import { getErrorMessage } from "@/lib/api-error";

/**
 * Profile and preferences page.
 * Data is stored in auth context for this mock/demo project.
 */
const ProfilePage = () => {
  const {
    deactivateAccount,
    logout,
    setTwoFactor,
    updateCurrency,
    updatePassword,
    updateProfile,
    user,
  } = useAuth();
  const navigate = useNavigate();

  const [profileForm, setProfileForm] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
    currency: user?.currency || "USD",
    timezone: user?.timezone || "America/New_York",
    monthlyBudget: String(user?.monthlyBudget || 5000),
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    newPasswordConfirm: "",
  });

  const [saved, setSaved] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [error, setError] = useState("");
  const [twoFactorSaving, setTwoFactorSaving] = useState(false);

  useEffect(() => {
    setProfileForm({
      fullName: user?.fullName || "",
      email: user?.email || "",
      currency: user?.currency || "USD",
      timezone: user?.timezone || "America/New_York",
      monthlyBudget: String(user?.monthlyBudget || 0),
    });
  }, [user]);

  const handleSave = async () => {
    setError("");

    try {
      await updateProfile({
        fullName: profileForm.fullName,
        email: profileForm.email,
        timezone: profileForm.timezone,
        monthlyBudget: profileForm.monthlyBudget
          ? Number.parseFloat(profileForm.monthlyBudget)
          : null,
      });

      if (profileForm.currency !== user?.currency) {
        await updateCurrency(profileForm.currency);
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (saveError) {
      setError(getErrorMessage(saveError, "Failed to update profile"));
    }
  };

  const handlePasswordUpdate = async () => {
    setError("");

    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      setError("Please fill in all password fields");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.newPasswordConfirm) {
      setError("New password and confirmation do not match");
      return;
    }

    try {
      await updatePassword(passwordForm);
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        newPasswordConfirm: "",
      });
      setPasswordSaved(true);
      setTimeout(() => setPasswordSaved(false), 2000);
    } catch (passwordError) {
      setError(getErrorMessage(passwordError, "Failed to update password"));
    }
  };

  const handleDeactivate = async () => {
    const shouldDeactivate = confirm(
      "Are you sure you want to deactivate your account? Your historical data will be preserved.",
    );

    if (!shouldDeactivate) {
      return;
    }

    try {
      await deactivateAccount();
      await logout();
      navigate("/login");
    } catch (deactivateError) {
      setError(getErrorMessage(deactivateError, "Failed to deactivate account"));
    }
  };

  const handleTwoFactorToggle = async (enabled) => {
    setError("");
    setTwoFactorSaving(true);
    try {
      await setTwoFactor(enabled);
    } catch (toggleError) {
      setError(getErrorMessage(toggleError, "Failed to update 2FA setting"));
    } finally {
      setTwoFactorSaving(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6 animate-fade-in">
      <h1 className="text-2xl font-display font-bold text-primary">
        Profile & Settings
      </h1>

      {error && (
        <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="glass-card-solid space-y-4 p-6">
        <div className="mb-2 flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/20 text-2xl font-bold font-display text-primary">
            {user?.fullName?.charAt(0) || "U"}
          </div>

          <div>
            <p className="font-semibold text-primary">{user?.fullName}</p>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
            <button
              className="mt-1 text-xs text-primary hover:underline"
              type="button"
            >
              Change avatar
            </button>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-primary">
              Full Name
            </label>
            <input
              className="glass-input w-full rounded-lg px-4 py-2.5 text-sm text-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
              onChange={(event) =>
                setProfileForm((previous) => ({
                  ...previous,
                  fullName: event.target.value,
                }))
              }
              value={profileForm.fullName}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-primary">
              Email
            </label>
            <input
              className="glass-input w-full rounded-lg px-4 py-2.5 text-sm text-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
              onChange={(event) =>
                setProfileForm((previous) => ({
                  ...previous,
                  email: event.target.value,
                }))
              }
              value={profileForm.email}
            />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-primary">
              Currency
            </label>
            <select
              className="glass-input w-full rounded-lg px-4 py-2.5 text-sm text-primary focus:outline-none"
              onChange={(event) =>
                setProfileForm((previous) => ({
                  ...previous,
                  currency: event.target.value,
                }))
              }
              value={profileForm.currency}
            >
              {CURRENCY_OPTIONS.map((currency) => (
                <option key={currency}>{currency}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-primary">
              Timezone
            </label>
            <select
              className="glass-input w-full rounded-lg px-4 py-2.5 text-sm text-primary focus:outline-none"
              onChange={(event) =>
                setProfileForm((previous) => ({
                  ...previous,
                  timezone: event.target.value,
                }))
              }
              value={profileForm.timezone}
            >
              {TIMEZONE_OPTIONS.map((timezone) => (
                <option key={timezone} value={timezone}>
                  {timezone.split("/").pop()?.replace("_", " ")}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-primary">
              Monthly Budget
            </label>
            <input
              className="glass-input w-full rounded-lg px-4 py-2.5 text-sm text-primary focus:outline-none"
              onChange={(event) =>
                setProfileForm((previous) => ({
                  ...previous,
                  monthlyBudget: event.target.value,
                }))
              }
              type="number"
              value={profileForm.monthlyBudget}
            />
          </div>
        </div>

        <button
          className="rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90"
          onClick={handleSave}
          type="button"
        >
          {saved ? "Saved!" : "Save Changes"}
        </button>
      </div>

      <div className="glass-card-solid space-y-4 p-6">
        <h3 className="text-base font-display font-semibold text-primary">
          Change Password
        </h3>

        <input
          className="glass-input w-full rounded-lg px-4 py-2.5 text-sm text-primary placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          onChange={(event) =>
            setPasswordForm((previous) => ({
              ...previous,
              currentPassword: event.target.value,
            }))
          }
          placeholder="Current password"
          type="password"
          value={passwordForm.currentPassword}
        />

        <div className="grid gap-3 sm:grid-cols-2">
          <input
            className="glass-input w-full rounded-lg px-4 py-2.5 text-sm text-primary placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            onChange={(event) =>
              setPasswordForm((previous) => ({
                ...previous,
                newPassword: event.target.value,
              }))
            }
            placeholder="New password"
            type="password"
            value={passwordForm.newPassword}
          />

          <input
            className="glass-input w-full rounded-lg px-4 py-2.5 text-sm text-primary placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            onChange={(event) =>
              setPasswordForm((previous) => ({
                ...previous,
                newPasswordConfirm: event.target.value,
              }))
            }
            placeholder="Confirm new"
            type="password"
            value={passwordForm.newPasswordConfirm}
          />
        </div>

        <button
          className="glass-card rounded-lg px-6 py-2.5 text-sm font-medium text-primary transition-all hover:bg-white/20"
          onClick={handlePasswordUpdate}
          type="button"
        >
          {passwordSaved ? "Password Updated" : "Update Password"}
        </button>
      </div>

      <div className="glass-card-solid p-6">
        <h3 className="mb-2 text-base font-display font-semibold text-primary">
          Security
        </h3>
        <p className="mb-3 text-sm text-muted-foreground">
          Enable two-factor authentication to require an OTP for every login.
        </p>
        <label className="flex items-center gap-3 text-sm text-primary">
          <input
            checked={Boolean(user?.twoFactorEnabled)}
            disabled={twoFactorSaving}
            onChange={(event) => handleTwoFactorToggle(event.target.checked)}
            type="checkbox"
          />
          {twoFactorSaving ? "Updating..." : "Require OTP at login"}
        </label>
      </div>

      <div className="glass-card-solid p-6">
        <h3 className="mb-2 text-base font-display font-semibold text-destructive">
          Danger Zone
        </h3>
        <p className="mb-3 text-sm text-muted-foreground">
          Deactivating your account preserves your historical data but disables
          access.
        </p>
        <button
          className="rounded-lg bg-destructive px-6 py-2.5 text-sm font-medium text-destructive-foreground transition-all hover:opacity-90"
          onClick={handleDeactivate}
          type="button"
        >
          Deactivate Account
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;
