import React, { useContext, useEffect, useState } from 'react';
import { MainContext } from '../context/context';
import '../styles/parent-dashboard.css';
import ParentDashboardNavbar from '../layout/ParentDashboardNavbar';
import {
  deleteResponsibilities,
  fetchUser,
  getFamilyStoreItems,
  updateResponsibility,
} from '../api-calls/api';
import ApproveResponsibilityModal from '../components/ApproveResponsibilityModal';
import ResponsibilityModal from '../components/ResponsibilityModal';
import { useNavigate } from 'react-router-dom';
import UnapprovedPurchases from '../components/UnapprovedPurchases';
import EditResponsibilityModal from '../components/EditResponsibilityModal';

export default function ParentDashboard() {
  const { main } = useContext(MainContext);
  const [selectedChildIdNeedingApproval, setSelectedChildIdNeedingApproval] =
    useState('all');
  const [
    selectedChildIdIncompleteResponsibilities,
    setSelectedChildIdIncompleteResponsibilities,
  ] = useState('all');
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentResponsibility, setCurrentResponsibility] = useState({});

  const navigate = useNavigate();

  function formatDate(dateString) {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  }

  useEffect(() => {
    fetchUser({ accessToken: main.state.accessToken, main });
    getFamilyStoreItems({ main });
  }, []);

  const handleResponsibilityClick = (responsibility, childName = '') => {
    setCurrentResponsibility(responsibility);
    setShowEditModal(true);
  };
  const handleApprovalClick = (responsibility, childName = '') => {
    setCurrentResponsibility(responsibility);
    setShowApproveModal(true);
  };

  async function editResponsibility({
    id,
    title,
    description,
    difficulty,
    completed,
  }) {
    try {
      await updateResponsibility({
        id,
        main,
        title,
        description,
        profileId: main.state.profile.id,
        difficulty,
        completed,
        date: currentResponsibility.date,
      });
    } catch (e) {
      console.error(e);
    }
  }

  async function handleDeleteResponsibility(id) {
    try {
      await deleteResponsibilities({
        main,
        profileId: main.state.profile.id,
        id,
      });
    } catch (e) {
      console.log(e);
    }
  }

  return (
    <>
      <ParentDashboardNavbar />
      <div className="parent-dashboard">
        <div className="family-store">
          <UnapprovedPurchases />
        </div>
        <div className="family-members">
          <h1 className="family-name">{main.state.profile.family.name}</h1>
          <div className="invitation-code">
            Invitation Code:
            <span style={{ fontWeight: '500' }}>
              {main.state.profile.family.invitation_code}
            </span>
          </div>
          <h2>Responsibilities Needing Approval</h2>
          <select
            onChange={(e) => setSelectedChildIdNeedingApproval(e.target.value)}
            value={selectedChildIdNeedingApproval}
          >
            <option value="all">All Kids</option>
            {main.state.profile.family.members
              .filter((member) => !member.parent)
              .map((child) => (
                <option key={child.id} value={child.id}>
                  {child.first_name}
                </option>
              ))}
          </select>
          <div style={{ maxWidth: '35rem' }}>
            {selectedChildIdNeedingApproval === 'all'
              ? main.state.profile.family.members.map((child) =>
                  child.responsibilities
                    .filter(
                      (responsibility) =>
                        responsibility.verified === false &&
                        responsibility.completed === false
                    )
                    .map((responsibility) => (
                      <div
                        onClick={() =>
                          handleApprovalClick(responsibility, child.first_name)
                        }
                        className="child-responsibility-to-approve"
                        key={responsibility.id}
                      >
                        {child.first_name}: {formatDate(responsibility.date)} -{' '}
                        {responsibility.title}
                      </div>
                    ))
                )
              : main.state.profile.family.members
                  .filter(
                    (child) =>
                      child.id.toString() === selectedChildIdNeedingApproval
                  )
                  .map((child) =>
                    child.responsibilities
                      .filter(
                        (responsibility) =>
                          responsibility.verified === false &&
                          responsibility.completed === false
                      )
                      .map((responsibility) => (
                        <div
                          onClick={() =>
                            handleApprovalClick(
                              responsibility,
                              child.first_name
                            )
                          }
                          className="child-responsibility-to-approve"
                          key={responsibility.id}
                        >
                          {formatDate(responsibility.date)} -{' '}
                          {responsibility.title}
                        </div>
                      ))
                  )}
          </div>
          <h2>All Incomplete Responsibilities</h2>
          <select
            onChange={(e) =>
              setSelectedChildIdIncompleteResponsibilities(e.target.value)
            }
            value={selectedChildIdIncompleteResponsibilities}
          >
            <option value="all">Whole Family</option>
            {main.state.profile.family.members.map((child) => (
              <option key={child.id} value={child.id}>
                {child.first_name}
              </option>
            ))}
          </select>
          {selectedChildIdIncompleteResponsibilities === 'all'
            ? main.state.profile.family.members.map((child) =>
                child.responsibilities
                  .filter((responsibility) => !responsibility.completed)
                  .map((responsibility) => (
                    <div
                      className="hover"
                      onClick={() =>
                        handleResponsibilityClick(
                          responsibility,
                          child.first_name
                        )
                      }
                      key={responsibility.id}
                    >
                      {child.first_name}: {formatDate(responsibility.date)} -{' '}
                      {responsibility.title}
                    </div>
                  ))
              )
            : main.state.profile.family.members
                .filter(
                  (child) =>
                    child.id.toString() ===
                    selectedChildIdIncompleteResponsibilities
                )
                .map((child) =>
                  child.responsibilities
                    .filter((responsibility) => !responsibility.completed)
                    .map((responsibility) => (
                      <div
                        className="hover"
                        onClick={() =>
                          handleResponsibilityClick(
                            responsibility,
                            child.first_name
                          )
                        }
                        key={responsibility.id}
                      >
                        {formatDate(responsibility.date)} -{' '}
                        {responsibility.title}
                      </div>
                    ))
                )}
        </div>
        <div className="responsibilities">
          <h2 className="hover" onClick={() => navigate('/responsibilities')}>
            My Responsibilities
          </h2>
          {main.state.profile.responsibilities
            .filter((resp) => !resp.completed)
            .map((responsibility) => (
              <div
                className="hover"
                onClick={() => handleResponsibilityClick(responsibility)}
                key={responsibility.id}
              >
                {formatDate(responsibility.date)} - {responsibility.title}
              </div>
            ))}
        </div>
        <div className="wallet">Wallet</div>
        <ApproveResponsibilityModal
          showApproveModal={showApproveModal}
          setShowApproveModal={setShowApproveModal}
          currentResponsibility={currentResponsibility}
          setCurrentResponsibility={setCurrentResponsibility}
        />
        <EditResponsibilityModal
          showEditModal={showEditModal}
          setShowEditModal={setShowEditModal}
          currentResponsibility={currentResponsibility}
          setCurrentResponsibility={setCurrentResponsibility}
          editResponsibility={editResponsibility}
          handleDeleteResponsibility={handleDeleteResponsibility}
          parentalControl={true}
        />
      </div>
    </>
  );
}
