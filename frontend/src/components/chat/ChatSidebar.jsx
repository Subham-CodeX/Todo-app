export default function ChatSidebar({

  tabs,

  activeTab,

  setActiveTab,

}) {

  return (

    <aside
      className="
        chat-sidebar
      "
    >

      {
        tabs.map(
          (tab) => (

            <button

              key={
                tab.id
              }

              className={

                `chat-nav-item
                ${
                  activeTab ===
                  tab.id
                    ? "active"
                    : ""
                }`

              }

              onClick={() =>
                setActiveTab(
                  tab.id
                )
              }

            >

              <span
                className="
                  chat-nav-icon
                "
              >

                {
                  tab.icon
                }

              </span>


              <span
                className="
                  chat-nav-label
                "
              >

                {
                  tab.label
                }

              </span>

            </button>

          )
        )
      }

    </aside>

  );

}