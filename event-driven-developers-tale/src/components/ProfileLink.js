import profilePic from "../images/profile-pic.jpg";
import { Link } from "react-router-dom";
import { Authenticator } from "@aws-amplify/ui-react";
import { API, graphqlOperation } from "aws-amplify";
import { useEffect, useState } from "react";
import { onVacationRequestNotification } from "../graphql/subscriptions";

function ProfileLink({ user }) {
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    subscribeNotifications();
  });

  function subscribeNotifications() {
    if (
      user?.signInUserSession.idToken.payload["cognito:groups"]?.includes(
        "Approvers"
      )
    ) {
      API.graphql(graphqlOperation(onVacationRequestNotification)).subscribe({
        next: () => {
          setNotificationCount(notificationCount + 1);
        },
        error: (error) => console.warn(error),
      });
    } else {
      const params = {
        owner: user.username,
      };
      API.graphql(
        graphqlOperation(onVacationRequestNotification, params)
      ).subscribe({
        next: () => {
          setNotificationCount(notificationCount + 1);
        },
        error: (error) => console.warn(error),
      });
    }
  }

  if (!user) return null;

  return (
    <Authenticator>
      {({ signOut, user }) => (
        <div className='-mx-2 border-t-2 py-2'>
          <div className='pl-4 flex items-center pb-2'>
            <img
              alt='profile-pic'
              className='w-16 h-16 rounded-full'
              src={profilePic}
            />
            <div>
              <div className='flex'>
                <p className='pl-2 text-base text-gray-800'>{user.username}</p>
                {notificationCount > 0 && (
                  <button className='px-2 rounded-full mx-2 bg-red-600 '>
                    <p className='text-sm text-white font-semibold'>
                      {notificationCount}
                    </p>
                  </button>
                )}
              </div>
              <Link to='/profile'>
                <p className='pl-2 text-sm text-gray-500'>View Profile</p>
              </Link>
            </div>
          </div>
          <div className='p-2'>
            <button onclick={signOut}>Sign out</button>
          </div>
        </div>
      )}
    </Authenticator>
  );
}

export default ProfileLink;
