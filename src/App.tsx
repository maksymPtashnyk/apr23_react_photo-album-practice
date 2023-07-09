import React, { useState } from 'react';
import './App.scss';
import classNames from 'classnames';

import usersFromServer from './api/users';
import photosFromServer from './api/photos';
import albumsFromServer from './api/albums';

const photos = photosFromServer.map(photo => {
  const album = albumsFromServer.find(
    selectAlbums => selectAlbums.id === photo.albumId,
  );
  const user = usersFromServer.find(
    selectUser => selectUser.id === album?.userId,
  );

  return { ...photo, album, user };
});

export const App: React.FC = () => {
  function selectedPeople(allPhotos: {
    album:
    { userId: number; id: number; title: string; } | undefined;
    user: { id: number; name: string; sex: string; } | undefined;
    albumId: number; id: number; title: string; url: string;
  }[], selectName: string, query: string, albumIds: number[]) {
    let currentPhotos = allPhotos;

    if (selectName) {
      currentPhotos = currentPhotos
        .filter(userName => userName.user?.name === selectName);
    }

    if (query) {
      const normalize = query.toLowerCase();

      currentPhotos = currentPhotos
        .filter(photoName => photoName.title.toLowerCase().includes(normalize));
    }

    if (albumIds.length > 0) {
      currentPhotos = currentPhotos.filter(
        photo => albumIds.some(id => id === photo.albumId),
      );
    }

    return currentPhotos;
  }

  const [selectName, setSelectName] = useState('');
  const [query, setQuery] = useState('');
  const [albumIds, setAlbumIds] = useState<number[]>([]);
  const filteredPhoto = selectedPeople(photos, selectName, query, albumIds);

  function isAlbumSelected(albumId: number): boolean {
    return albumIds.includes(albumId);
  }

  function toggleAlbum(albumId: number): void {
    if (isAlbumSelected(albumId)) {
      setAlbumIds(albumIds.filter(id => id !== albumId));
    } else {
      setAlbumIds([...albumIds, albumId]);
    }
  }

  return (
    <div className="section">
      <div className="container">
        <h1 className="title">Photos from albums</h1>

        <div className="block">
          <nav className="panel">
            <p className="panel-heading">Filters</p>

            <p className="panel-tabs has-text-weight-bold">
              <a
                data-cy="FilterAllUsers"
                href="#/"
                className={classNames({
                  'is-active': selectName === '',
                })}
                onClick={() => setSelectName('')}
              >
                All
              </a>
              {usersFromServer.map(user => (
                <a
                  data-cy="FilterUser"
                  href="#/"
                  className={classNames({
                    'is-active': selectName === user.name,
                  })}
                  onClick={() => setSelectName(user.name)}
                >
                  {user.name}
                </a>
              ))}
            </p>

            <div className="panel-block">
              <p className="control has-icons-left has-icons-right">
                <input
                  type="text"
                  className="input"
                  placeholder="Search"
                  value={query}
                  onChange={event => setQuery(event.target.value)}
                />

                <span className="icon is-left">
                  <i className="fas fa-search" aria-hidden="true" />
                </span>
                {query && (
                  <span className="icon is-right">
                    {/* eslint-disable-next-line jsx-a11y/control-has-associated-label */}
                    <button
                      type="button"
                      className="delete"
                      onClick={() => setQuery('')}
                    />
                  </span>
                )}

              </p>
            </div>
            <div className="panel-block is-flex-wrap-wrap">
              <a
                href="#/"
                className={classNames('button is-success mr-6', {
                  'is-outlined': albumIds.length > 0,
                })}
                onClick={() => setAlbumIds([])}
              >
                All
              </a>

              {albumsFromServer.map(album => (
                <a
                  className={classNames('button mr-2 my-1', {
                    'is-info': isAlbumSelected(album.id),
                  })}
                  href="#/"
                  onClick={() => toggleAlbum(album.id)}
                >
                  {album.title}
                </a>
              ))}
            </div>

            <div className="panel-block">
              <a
                href="#/"
                className="button is-link is-outlined is-fullwidth"
                onClick={() => [setSelectName(''),
                  setQuery(''),
                  setAlbumIds([])]}

              >
                Reset all filters
              </a>
            </div>
          </nav>
        </div>

        <div className="box table-container">
          {photos.length === 0
            ? (
              <p data-cy="NoMatchingMessage">
                No photos matching selected criteria
              </p>
            ) : (
              <table
                className="table is-striped is-narrow is-fullwidth"
              >
                <thead>
                  <tr>
                    <th>
                      <span className="is-flex is-flex-wrap-nowrap">
                        ID

                        <a href="#/">
                          <span className="icon">
                            <i data-cy="SortIcon" className="fas fa-sort" />
                          </span>
                        </a>
                      </span>
                    </th>

                    <th>
                      <span className="is-flex is-flex-wrap-nowrap">
                        Photo name

                        <a href="#/">
                          <span className="icon">
                            <i className="fas fa-sort-down" />
                          </span>
                        </a>
                      </span>
                    </th>

                    <th>
                      <span className="is-flex is-flex-wrap-nowrap">
                        Album name

                        <a href="#/">
                          <span className="icon">
                            <i className="fas fa-sort-up" />
                          </span>
                        </a>
                      </span>
                    </th>

                    <th>
                      <span className="is-flex is-flex-wrap-nowrap">
                        User name

                        <a href="#/">
                          <span className="icon">
                            <i className="fas fa-sort" />
                          </span>
                        </a>
                      </span>
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredPhoto.map(photo => (
                    <tr>
                      <td className="has-text-weight-bold">
                        {photo.id}
                      </td>

                      <td>{photo.title}</td>
                      <td>{photo.album?.title}</td>

                      <td className={classNames({
                        'has-text-link': photo.user?.sex === 'm',
                        'has-text-danger': photo.user?.sex === 'f',
                      })}
                      >
                        {photo.user?.name}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
        </div>
      </div>
    </div>
  );
};
