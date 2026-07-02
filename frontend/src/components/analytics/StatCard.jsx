function StatCard({

  title,

  value,

  icon,

  color,

}) {

  return (

    <div
      className="stat-card-v2"
      style={{
        borderColor: color,
      }}
    >

      <div
        className="stat-icon"
        style={{
          background: color,
        }}
      >
        {icon}
      </div>

      <h2>

        {value}

      </h2>

      <p>

        {title}

      </p>

      <div
        className="bottom-wave"
        style={{
          background: color,
        }}
      />

    </div>

  );

}

export default StatCard;